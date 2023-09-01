import { decryptAttachment } from 'matrix-encrypt-attachment'
import type { MatrixEvent, Room, RoomMember } from 'matrix-js-sdk'
import type { WrappedEvent } from './event'
import {
	Crypto,
	ClientEvent,
	CryptoEvent,
	RoomMemberEvent,
	IndexedDBCryptoStore,
	IndexedDBStore,
	createClient
} from 'matrix-js-sdk'

class MatrixClientWrapper {
	matrixClient: import('matrix-js-sdk').MatrixClient
	allRooms: import('matrix-js-sdk').Room[]
	verificationMethods: string[]

	constructor() {
		/**
		 * matrixClient is a matrix-js-sdk client instance.
		 * @type {import('matrix-js-sdk').MatrixClient}
		 * @public
		 */
		// @ts-ignore
		this.matrixClient = null
		this.allRooms = []
		this.verificationMethods = []
	}
	async start() {
		if (this.matrixClient) return
		const { verificationMethods } = await import('matrix-js-sdk/lib/crypto')
		this.verificationMethods = [verificationMethods.SAS]
		// Initialize IndexedDB stores
		const indexedDBStore = new IndexedDBStore({
			indexedDB,
			localStorage,
			dbName: 'web-sync-store'
		})
		const cryptoStore = new IndexedDBCryptoStore(indexedDB, 'crypto-store')
		await indexedDBStore.startup()

		const matrixClient = createClient({
			baseUrl: localStorage.getItem('homeserver') ?? '',
			accessToken: localStorage.getItem('token') ?? undefined,
			userId: localStorage.getItem('user_id') ?? '',
			store: indexedDBStore,
			deviceId: localStorage.getItem('device_id') ?? '',
			cryptoStore,
			verificationMethods: this.verificationMethods,
			timelineSupport: true
		})

		await matrixClient.initCrypto()
		await matrixClient.startClient()
		matrixClient.setGlobalErrorOnUnknownDevices(false)
		this.matrixClient = matrixClient
		// @ts-ignore
		window.debug_matrixClient = matrixClient

		await new Promise<void>(resolve => {
			matrixClient.once(ClientEvent.Sync, () => {
				resolve()
			})
		})
		this.allRooms = await this.loadAllRooms()

		// Handle verification requests
		matrixClient.on(CryptoEvent.VerificationRequestReceived, async request => {
			await request.accept()
			const verifier = await request.startVerification(verificationMethods.SAS)
			verifier.on(Crypto.VerifierEvent.ShowSas, async sasData => {
				await sasData.confirm()
			})
			await verifier.verify()
		})

		matrixClient.on(RoomMemberEvent.Membership, async () => {
			this.allRooms = await this.loadAllRooms()
		})
	}
	getRoom(roomId: string) {
		return this.matrixClient.getRoom(roomId)
	}
	getUserId() {
		return this.matrixClient.getUserId()
	}
	async loadAllRooms(includeDMs = true) {
		const allRooms = (await this.matrixClient.getJoinedRooms()).joined_rooms
			.map(roomId => this.matrixClient.getRoom(roomId))
			.filter(a => a)
		if (includeDMs) {
			return <Room[]>allRooms.filter(room => room)
		}
		const dmRoomIds = this.getDmRoomIds()
		return <Room[]>allRooms.filter(room => {
			if (!room) return false
			return dmRoomIds.includes(room.roomId)
		})
	}
	getAllRooms() {
		return this.allRooms
	}
	getDmRoomIds() {
		const dms = this.matrixClient.getAccountData('m.direct')
		if (!dms) return []
		return Object.values(dms.getContent()).flat()
	}
	getDmRooms() {
		return this.getDmRoomIds().map(id => this.getRoom(id))
	}
	async deleteEvent(event: WrappedEvent) {
		return this.matrixClient.redactEvent(event.room.roomId, event.id)
	}
	async decryptEvent(event: MatrixEvent) {
		if (event.shouldAttemptDecryption()) {
			// @ts-ignore
			await event.attemptDecryption(this.matrixClient.crypto, { isRetry: true })
		}
		return event
	}
	async getAttachment(event: WrappedEvent) {
		if (!event.content) throw new Error('No content')
		const isEncrypted = !event.content.url
		const url = this.matrixClient.mxcUrlToHttp(
			isEncrypted ? event.content.file.url : event.content.url
		)
		if (!url) throw new Error('Invalid URL')
		if (!isEncrypted) {
			return url
		}
		const media = await (await fetch(url)).arrayBuffer()
		const decrypted = await decryptAttachment(media, event.content.file)
		const blob = new Blob([decrypted], { type: event.content.file.mimetype })
		return URL.createObjectURL(blob)
	}
	getMemberAvatarUrl(member: RoomMember, size = 64) {
		const avatar = member.getAvatarUrl(
			this.matrixClient.baseUrl,
			size,
			size,
			'crop',
			false,
			true
		)
		if (avatar?.startsWith('mxc://')) {
			return this.matrixClient.mxcUrlToHttp(avatar)
		}
		return avatar
	}
	getRoomAvatarUrl(room: Room, size = 64) {
		const avatar = room.getAvatarUrl(
			this.matrixClient.baseUrl,
			size,
			size,
			'crop'
		)
		if (avatar) {
			if (avatar?.startsWith('mxc://')) {
				return this.matrixClient.mxcUrlToHttp(avatar)
			}
			return avatar
		}
		const fallbackMember = room.getAvatarFallbackMember()
		if (!fallbackMember) return null
		return this.getMemberAvatarUrl(fallbackMember, size)
	}
	async #decryptTimeline(timeline: MatrixEvent[]) {
		const decryptionPromises = timeline
			// @ts-ignore
			.filter(event => event.isEncrypted() && !event.clearEvent)
			.reverse()
			.map(event =>
				// @ts-ignore
				event.attemptDecryption(this.matrixClient.crypto, { isRetry: true })
			)

		return Promise.allSettled(decryptionPromises)
	}
	getLastMessageEvent(timeline: WrappedEvent[], i: number) {
		return timeline
			.slice(0, i)
			.reverse()
			.filter(e => e)
			.find(e => e.type === 'm.room.message')
	}
	getNextMessageEvent(timeline: WrappedEvent[], i: number) {
		return timeline
			.slice(i + 1)
			.filter(e => e)
			.find(e => e.type === 'm.room.message')
	}
	async wrapTimeline(timeline: MatrixEvent[], room: Room) {
		let newTimeline: WrappedEvent[] = []
		for (const event of timeline) {
			if (event.isRedacted()) continue
			switch (event.getType()) {
				case 'm.reaction': {
					const content = event.getContent()
					if (!content?.['m.relates_to']?.key || !event.sender) continue
					const relatesToId = event.relationEventId
					const relatesToIndex = newTimeline.findIndex(
						e => e.id === relatesToId
					)
					if (relatesToIndex == -1) continue
					newTimeline[relatesToIndex].reactions[content['m.relates_to'].key] =
						newTimeline[relatesToIndex].reactions[
							content['m.relates_to'].key
						] ?? {
							shortcode: content.shortcode,
							senders: []
						}
					const thisReaction =
						newTimeline[relatesToIndex].reactions[content['m.relates_to'].key]
					if (!thisReaction.senders.includes(event.sender)) {
						thisReaction.senders.push(event.sender)
					}
					break
				}
				case 'm.room.redaction': {
					const relatesToId = event.getAssociatedId()
					newTimeline = newTimeline.filter(e => e.id != relatesToId)
					break
				}
				default:
					console.warn('Unknown event type', event.getType())
				// eslint-disable-next-line no-fallthrough
				case 'm.room.message':
					const wrappedEvent = await this.#wrapEvent(event, room)
					if (wrappedEvent.editOriginalId) {
						const relatesToIndex = newTimeline.findIndex(
							e => e.id === wrappedEvent.editOriginalId
						)
						if (relatesToIndex == -1) continue
						if (newTimeline[relatesToIndex].content) {
							newTimeline[relatesToIndex].content = wrappedEvent.content
						}
						newTimeline[relatesToIndex].edited = true
						continue
					}
					const timelineIndex = newTimeline.findIndex(
						e => e.id == wrappedEvent.id
					)
					if (timelineIndex != -1) {
						continue
					}
					newTimeline.push(wrappedEvent)
					break
			}
		}
		return newTimeline
	}
	async #wrapEvent(event: MatrixEvent, room: Room): Promise<WrappedEvent> {
		const type = event.getType()
		if (event.isBeingDecrypted()) {
			await event.getDecryptionPromise()
		} else if (event.shouldAttemptDecryption()) {
			// @ts-ignore
			await event.attemptDecryption(this.matrixClient.crypto, { isRetry: true })
		}
		let replyEvent: MatrixEvent | undefined
		if (event.replyEventId) {
			replyEvent = room.findEventById(event.replyEventId)
		}
		const clearContent = event.isEncrypted()
			? event.getClearContent()
			: event.getContent()
		let editOriginalId = undefined
		if (clearContent?.['m.new_content']) {
			editOriginalId = event.relationEventId
		}
		return {
			edited: false,
			_debug: event,
			room: room,
			id: <string>event.getId(),
			type: type,
			sender: event.sender ?? undefined,
			reactions: {},
			replyEvent: replyEvent
				? await this.#wrapEvent(replyEvent, room)
				: undefined,
			content: clearContent ?? undefined,
			editOriginalId
		}
	}
}

export default new MatrixClientWrapper()
