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
	if (!event.isEncrypted()) return
	if (event.clearEvent) return
	if (event.event.type == 'm.room.encrypted') {
		await event.attemptDecryption(window.matrixClient.crypto, { isRetry: true })
	}
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
