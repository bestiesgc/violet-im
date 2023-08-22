<script>
	import Message from './Message.svelte'

	export let event
	export let lastEvent
	export let nextEvent

	let eventStuff = event.clearEvent ?? event.event
	async function loadEventStuff() {
		await event.getDecryptionPromise()
		eventStuff = event.clearEvent
	}
	if (!event.clearEvent) {
		loadEventStuff()
	}
</script>

<div class="event-wrapper">
	<div class="event">
		{#if event.event?.type == 'm.room.encrypted'}
			{#if eventStuff && eventStuff?.type == 'm.room.message'}
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
		background-color: #a1a2d320;
	}
</style>
