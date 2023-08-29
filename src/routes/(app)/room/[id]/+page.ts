import client from '$lib/client/index'
import { EventTimeline } from 'matrix-js-sdk'

export async function load({ params }) {
	if (params.id == '@me') return {}
	await client.start()
	const dmRoomIds = client.getDmRoomIds()
	const room = client.getRoom(params.id)
	if (!room) throw new Error('Room not found')
	let space = room.isSpaceRoom() ? room : null
	const roomIsSpace = space ? true : false
	if (!space) {
		const parent = (room
			.getLiveTimeline()
			.getState(EventTimeline.FORWARDS)
			?.getStateEvents('m.space.parent') ?? [])?.[0]?.getStateKey()
		if (parent) space = client.getRoom(parent)
	}
	const spaceChildren = space
		?.getLiveTimeline()
		.getState(EventTimeline.FORWARDS)
		?.getStateEvents('m.space.child')
		.map(e => e?.getStateKey())
	return {
		room,
		space,
		roomIsSpace,
		roomId: room.roomId,
		isDirectMessage: dmRoomIds.includes(room.roomId),
		spaceChildren
	}
}
