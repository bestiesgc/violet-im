<script>
	import Message from './Message.svelte'
	import { decryptEvent } from '$lib/client/index.js'

	export let event
	export let lastEvent
	export let nextEvent

	let eventStuff
	async function loadEventStuff(event) {
		await decryptEvent(event)
		const clearContent = event.getClearContent()
		eventStuff = {
			type: event.getType(),
			sender: event.getSender(),
			content: clearContent
		}
	}
	$: loadEventStuff(event)
</script>

<div class="event-wrapper">
	<div class="event">
		{#if event.event?.type == 'm.room.encrypted'}
			{#if eventStuff && eventStuff.type == 'm.room.message'}
				<Message
					event={eventStuff}
					sender={event.sender}
					endsGroup={nextEvent?.sender.userId != event.sender.userId}
					startsGroup={lastEvent?.sender.userId != event.sender.userId}
				/>
			{:else}
				<Message
					event={{ content: { body: 'Encrypted message, loading...' } }}
					sender={event.sender}
					endsGroup={nextEvent?.sender.userId != event.sender.userId}
					startsGroup={lastEvent?.sender.userId != event.sender.userId}
				/>
			{/if}
		{/if}
	</div>
</div>

<style>
	.event-wrapper:hover {
		background-color: #a1a2d310;
	}
</style>
