async function importDependencies() {
	if (typeof window != 'undefined') window.global ||= window
	const {
		ClientEvent,
		CryptoEvent,
		IndexedDBCryptoStore,
		IndexedDBStore,
		createClient
	} = await import('matrix-js-sdk')
	const { VerifierEvent } = await import('matrix-js-sdk/lib/crypto-api')
	const { verificationMethods } = await import('matrix-js-sdk/lib/crypto')
	return {
		ClientEvent,
		CryptoEvent,
		IndexedDBCryptoStore,
		IndexedDBStore,
		createClient,
		VerifierEvent,
		verificationMethods
	}
}

class MatrixClientWrapper {
	constructor() {}
	async start() {
		if (this.matrixClient) return
		const {
			ClientEvent,
			CryptoEvent,
			IndexedDBCryptoStore,
			IndexedDBStore,
			createClient,
			VerifierEvent,
			verificationMethods
		} = await importDependencies()
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
			verificationMethods: [verificationMethods.SAS],
			timelineSupport: true
		})

		await matrixClient.initCrypto()
		await matrixClient.startClient()
		matrixClient.setGlobalErrorOnUnknownDevices(false)
		this.matrixClient = matrixClient

		await new Promise(resolve => {
			matrixClient.once(ClientEvent.Sync, () => {
				resolve()
			})
		})

		// Handle verification requests
		matrixClient.on(CryptoEvent.VerificationRequest, async request => {
			await request.accept()
			const verifier = request.beginKeyVerification(verificationMethods.SAS)
			verifier.on(VerifierEvent.ShowSas, async sasData => {
				await sasData.confirm()
			})
			await verifier.verify()
		})
	}
	getRoom(roomId) {
		return this.matrixClient.getRoom(roomId)
	}
	getUserId() {
		return this.matrixClient.getUserId()
	}
	async getAllRooms(includeDMs = true) {
		const allRooms = (await this.matrixClient.getJoinedRooms()).joined_rooms
			.map(roomId => this.matrixClient.getRoom(roomId))
			.filter(a => a)
		if (includeDMs) {
			return allRooms
		}
		const dmRoomIds = this.getDmRoomIds()
		return allRooms.filter(room => dmRoomIds.includes(room.roomId))
	}
	getDmRoomIds() {
		return Object.values(
			this.matrixClient.getAccountData('m.direct')?.getContent()
		).flat()
	}
	getDmRooms() {
		return this.getDmRoomIds().map(id => this.getRoom(id))
	}
	async decryptEvent(event) {
		if (!event.isEncrypted()) return event
		if (event.clearEvent) return event
		await event.attemptDecryption(this.matrixClient.crypto, { isRetry: true })
		return event
	}
	getMemberAvatarUrl(member, size = 64) {
		const avatar = member.getAvatarUrl(
			this.matrixClient.baseUrl,
			size,
			size,
			'crop'
		)
		return avatar
	}
	getRoomAvatarUrl(room, size = 64) {
		const avatar = room.getAvatarUrl(
			this.matrixClient.baseUrl,
			size,
			size,
			'crop'
		)
		if (avatar) return avatar
		const fallbackMember = room.getAvatarFallbackMember()
		if (!fallbackMember) return null
		return this.getMemberAvatarUrl(fallbackMember, size)
	}
	async decryptTimeline(timeline) {
		return await Promise.all(timeline.map(e => this.decryptEvent(e)))
	}
	getLastMessageEvent(timeline, i) {
		return timeline
			.slice(0, i)
			.reverse()
			.filter(e => e)
			.find(e => e.getType() === 'm.room.message')
	}
	getNextMessageEvent(timeline, i) {
		return timeline
			.slice(i + 1)
			.filter(e => e)
			.find(e => e.getType() === 'm.room.message')
	}
	async wrapTimeline(timeline) {
		timeline = await this.decryptTimeline(timeline)
		const newTimeline = []
		for (const event of timeline) {
			switch (event.getType()) {
				case 'm.reaction': {
					const content = event.getContent()
					const relatesToIndex = newTimeline.findIndex(
						e => e.getId() === content['m.relates_to'].event_id
					)
					if (relatesToIndex == -1) continue
					newTimeline[relatesToIndex].reactions =
						newTimeline[relatesToIndex].reactions ?? {}
					newTimeline[relatesToIndex].reactions[content['m.relates_to'].key] =
						newTimeline[relatesToIndex].reactions[
							content['m.relates_to'].key
						] ?? {
							shortcode: content.shortcode,
							senders: []
						}
					newTimeline[relatesToIndex].reactions[
						content['m.relates_to'].key
					].senders.push(event.sender)
					break
				}
				default:
					console.warn('Unknown event type', event.getType())
				// eslint-disable-next-line no-fallthrough
				case 'm.room.message':
					newTimeline.push(event)
					break
			}
		}
		return newTimeline
	}
}

export default new MatrixClientWrapper()
