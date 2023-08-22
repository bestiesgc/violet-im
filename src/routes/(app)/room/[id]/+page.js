if (typeof window != 'undefined') window.global ||= window

import { loadClient } from '$lib/client/load.js'
const { EventTimeline } = await import('matrix-js-sdk')

export async function load({ params }) {
	if (params.id == '@me') return {}
	await loadClient()
	const dmRoomIds = Object.values(
		window.matrixClient.getAccountData('m.direct')?.getContent()
	).flat()
	const room = window.matrixClient.getRoom(params.id)
	let space = room.isSpaceRoom() ? room : null
	const roomIsSpace = space ? true : false
	if (!space) {
		const parent = (room
			.getLiveTimeline()
			.getState(EventTimeline.FORWARDS)
			?.getStateEvents('m.space.parent') ?? [])?.[0]?.getStateKey()
		if (parent) space = window.matrixClient.getRoom(parent)
	}
	const spaceChildren = space
		?.getLiveTimeline()
		.getState(EventTimeline.FORWARDS)
		?.getStateEvents('m.space.child')
		.map(e => e?.getStateKey())
	return {
		room,
		roomIsSpace,
		roomId: room.roomId,
		isDirectMessage: dmRoomIds.includes(room.roomId),
		spaceChildren
	}
}
