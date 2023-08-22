<script>
	import { onMount } from 'svelte'
	import { RoomEvent } from 'matrix-js-sdk'
	import Event from '$lib/Event/Event.svelte'

	export let room
	$: timeline = room.getLiveTimeline().events

	function onNewEvent() {
		timeline = timeline
	}
</script>

<ol class="timeline scroller">
	<div style:margin-top="auto"></div>
	{#each timeline as event, i}
		<li>
			<Event {event} nextEvent={timeline[i + 1]} lastEvent={timeline[i - 1]} />
		</li>
	{/each}
</ol>

<style>
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
