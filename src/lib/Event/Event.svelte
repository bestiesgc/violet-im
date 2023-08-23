<script>
	import Message from './Message.svelte'

	export let event
	export let lastEvent
	export let nextEvent

	let eventStuff
	async function loadEventStuff(event) {
		const clearContent = event.isEncrypted()
			? event.getClearContent()
			: event.getContent()
		eventStuff = {
			type: event.getType(),
			sender: event.getSender(),
			reactions: event.reactions,
			replyEvent: event.replyEvent,
			content: clearContent
		}
	}
	$: loadEventStuff(event)
</script>

<div class="event-wrapper">
	<div class="event" id="message_{event?.getId()}">
		{#if eventStuff && eventStuff.type == 'm.room.message'}
			<Message
				event={eventStuff}
				sender={event.sender}
				{nextEvent}
				{lastEvent}
			/>
		{/if}
	</div>
</div>

<style lang="postcss">
	.event-wrapper:hover {
		background-color: #a1a2d310;
	}
	.event {
		transition: background-color 500ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.event:global(.highlight) {
		background-color: var(--violet-600);
	}
</style>
