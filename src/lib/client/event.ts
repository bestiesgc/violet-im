import type { IContent, MatrixEvent, Room, RoomMember } from 'matrix-js-sdk'

export interface WrappedEvent {
	edited: boolean
	_debug: MatrixEvent
	room: Room
	type: string
	sender?: RoomMember
	receipts: RoomMember[]
	id: string
	reactions: {
		[key: string]: {
			shortcode: string
			senders: RoomMember[]
		}
	}
	replyEvent?: WrappedEvent
	content?: IContent
	editOriginalId: string | undefined
}

export interface WrappedMessageEvent extends WrappedEvent {
	sender: RoomMember
	content: IContent
}
