<script>
	import { tap, holdtap } from '../actions/tap.js'
	import Message from './Message.svelte'
	import { getContext } from 'svelte'

	const selection = getContext('selection')

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
			sender: event.sender,
			reactions: event.reactions,
			replyEvent: event.replyEvent,
			content: clearContent
		}
	}
	function updateSelection() {
		if (!$selection) {
			$selection = [event]
		} else {
			if ($selection.includes(event)) {
				$selection = $selection.filter(e => e !== event)
				if ($selection.length === 0) $selection = null
			} else {
				$selection = [...$selection, event]
			}
		}
	}
	$: loadEventStuff(event)
</script>

<div
	class="event-wrapper"
	class:selected={$selection?.includes(event)}
	use:holdtap={updateSelection}
	use:tap={() => ($selection ? updateSelection() : null)}
>
	<div class="event" id="message_{event?.getId()}">
		{#if eventStuff && eventStuff.type == 'm.room.message'}
			<Message event={eventStuff} {nextEvent} {lastEvent} />
		{/if}
	</div>
</div>

<style lang="postcss">
	.event-wrapper:hover {
		background-color: #a1a2d310;
	}
	.event-wrapper {
		transition: background-color 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.event-wrapper.selected,
	.event-wrapper:global(.highlight) {
		background-color: var(--slate-600);
	}
</style>
