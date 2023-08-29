import type { IContent, Room, RoomMember } from 'matrix-js-sdk'

export interface WrappedEvent {
	room: Room
	type: string
	sender?: RoomMember
	id: string
	reactions: {
		[key: string]: {
			shortcode: string
			senders: RoomMember[]
		}
	}
	replyEvent?: WrappedEvent
	content?: IContent
}

export interface WrappedMessageEvent extends WrappedEvent {
	sender: RoomMember
	content: IContent
}
