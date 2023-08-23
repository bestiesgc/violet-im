<script>
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'
	import client from '$lib/client/index.js'
	import Event from '$lib/Event/Event.svelte'

	export let room

	let timelineElement
	let timeline = room.getLiveTimeline().events
	let wrappedTimeline = []

	function onTimeline() {
		client.wrapTimeline(timeline, room).then(timeline => {
			wrappedTimeline = timeline
		})
	}

	onTimeline()

	let shouldScroll = true

	beforeUpdate(() => {
		if (timelineElement) {
			shouldScroll =
				timelineElement.scrollTop + timelineElement.offsetHeight ==
				timelineElement.scrollHeight
		}
	})

	afterUpdate(() => {
		if (shouldScroll) {
			timelineElement.scrollTop = timelineElement.scrollHeight
		}
	})

	onMount(() => {
		room.on('Room.timeline', onTimeline)
		return () => {
			room.off('Room.timeline', onTimeline)
		}
	})
</script>

<ol class="timeline scroller" bind:this={timelineElement}>
	<div style:margin-top="auto"></div>
	{#each wrappedTimeline as event, i (event.getId())}
		<li>
			<Event
				{event}
				nextEvent={client.getNextMessageEvent(wrappedTimeline, i)}
				lastEvent={client.getLastMessageEvent(wrappedTimeline, i)}
			/>
		</li>
	{/each}
</ol>

<style lang="postcss">
	.timeline {
		display: flex;
		flex-direction: column;
		list-style: none;
		padding: 0.5rem 0;
		margin: 0;
		height: 100%;
		word-break: break-word;
	}
	.timeline :global(.event) {
		padding: 0 0.5rem;
		max-width: 60rem;
		margin: 0 auto;
	}
</style>
