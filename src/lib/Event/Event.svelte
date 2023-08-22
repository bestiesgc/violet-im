<script>
	import Message from './Message.svelte'

	export let event
	export let lastEvent
	export let nextEvent

	let eventStuff
	async function loadEventStuff(event) {
		const clearContent = event.getClearContent()
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
	<div class="event">
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
</style>
