import loadClient from './load.js'

export async function start() {
	await loadClient()
}
export function getRoom(roomId) {
	return window.matrixClient.getRoom(roomId)
}
export function getUserId() {
	return window.matrixClient.getUserId()
}
export async function getAllRooms(includeDMs = true) {
	const allRooms = (await window.matrixClient.getJoinedRooms()).joined_rooms
		.map(roomId => window.matrixClient.getRoom(roomId))
		.filter(a => a)
	if (includeDMs) {
		return allRooms
	}
	const dmRoomIds = getDmRoomIds()
	return allRooms.filter(room => dmRoomIds.includes(room.roomId))
}
export function getDmRoomIds() {
	return Object.values(
		window.matrixClient.getAccountData('m.direct')?.getContent()
	).flat()
}
export function getDmRooms() {
	return getDmRoomIds().map(id => getRoom(id))
}
export async function decryptEvent(event) {
	if (!event.isEncrypted()) return event
	if (event.clearEvent) return event
	await event.attemptDecryption(window.matrixClient.crypto, { isRetry: true })
	return event
}
export function getMemberAvatarUrl(member, size = 64) {
	const avatar = member.getAvatarUrl(
		window.matrixClient.baseUrl,
		size,
		size,
		'crop'
	)
	return avatar
}
export function getRoomAvatarUrl(room, size = 64) {
	const avatar = room.getAvatarUrl(
		window.matrixClient.baseUrl,
		size,
		size,
		'crop'
	)
	if (avatar) return avatar
	const fallbackMember = room.getAvatarFallbackMember()
	if (!fallbackMember) return null
	return getMemberAvatarUrl(fallbackMember, size)
}
export async function decryptTimeline(timeline) {
	return await Promise.all(timeline.map(e => decryptEvent(e)))
}
export function getLastMessageEvent(timeline, i) {
	return timeline
		.slice(0, i)
		.reverse()
		.filter(e => e)
		.find(e => e.getType() === 'm.room.message')
}
export function getNextMessageEvent(timeline, i) {
	return timeline
		.slice(i + 1)
		.filter(e => e)
		.find(e => e.getType() === 'm.room.message')
}
export async function wrapTimeline(timeline) {
	timeline = await decryptTimeline(timeline)
	const newTimeline = []
	for (const event of timeline) {
		switch (event.getType()) {
			case 'm.reaction': {
				const content = event.getContent()
				const relatesToIndex = newTimeline.findIndex(
					e => e.getId() === content['m.relates_to'].event_id
				)
				newTimeline[relatesToIndex].reactions =
					newTimeline[relatesToIndex].reactions ?? {}
				newTimeline[relatesToIndex].reactions[content['m.relates_to'].key] =
					newTimeline[relatesToIndex].reactions[content['m.relates_to'].key] ??
					[]
				newTimeline[relatesToIndex].reactions[content['m.relates_to'].key].push(
					event.sender
				)
				break
			}
			default:
				console.log('Unknown event type', event.getType())
			// eslint-disable-next-line no-fallthrough
			case 'm.room.message':
				newTimeline.push(event)
				break
		}
	}
	return newTimeline
}
