<script lang="ts">
	import type { WrappedEvent, WrappedMessageEvent } from '$lib/client/event.js'
	import type { Writable } from 'svelte/store'
	import { tap, holdtap } from '../actions/tap.js'
	import Message from './Message.svelte'
	import { getContext } from 'svelte'

	const selection: Writable<WrappedEvent[] | null> = getContext('selection')

	let eventElement: HTMLElement

	export let event: WrappedEvent
	export let lastEvent: WrappedEvent | null
	export let nextEvent: WrappedEvent | null

	let messageEvent = <WrappedMessageEvent>event

	function updateSelection(touchEvent?: Event) {
		if ((<Element | null>touchEvent?.target)?.closest('button') != null) return
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
</script>

<div
	class="event-wrapper"
	class:selected={$selection?.includes(event)}
	bind:this={eventElement}
	use:holdtap={updateSelection}
	use:tap={event => ($selection ? updateSelection(event) : null)}
	on:touchstart={() =>
		eventElement.animate(
			[{ backgroundColor: '#a1a2d310' }, { backgroundColor: 'transparent' }],
			{ duration: 500 }
		)}
>
	<div class="event" id="message_{event.id}">
		{#if event.type == 'm.room.message'}
			<Message event={messageEvent} {nextEvent} {lastEvent} />
		{/if}
	</div>
</div>

<style lang="postcss">
	.event-wrapper {
		transition: background-color 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.event-wrapper.selected,
	.event-wrapper:global(.highlight) {
		background-color: var(--slate-600) !important;
	}
	.event {
		position: relative;
		padding: 0 0.5rem;
		max-width: 60rem;
		margin: 0 auto;
	}
	@media screen and (min-width: 600.01px) {
		.event-wrapper:hover {
			background-color: #a1a2d310;
		}
	}
</style>
