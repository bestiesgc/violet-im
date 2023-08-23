<script>
	import client from '$lib/client/index.js'
	import Event from '$lib/Event/Event.svelte'
	import { onMount } from 'svelte'

	export let room

	let timeline = room.getLiveTimeline().events
	let wrappedTimeline = []

	function onTimeline() {
		client.wrapTimeline(timeline, room).then(timeline => {
			wrappedTimeline = timeline
		})
	}

	onMount(() => {
		room.on('Room.timeline', onTimeline)
		return () => {
			room.off('Room.timeline', onTimeline)
		}
	})
</script>

<ol class="timeline scroller">
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
