<script>
	import { onMount } from 'svelte'
	import { RoomEvent } from 'matrix-js-sdk'
	import Event from './Event.svelte'

	export let room
	$: timeline = room.getLiveTimeline().events

	function onNewEvent() {
		timeline = timeline
	}

	onMount(() => {
		window.matrixClient.on(RoomEvent.Timeline, onNewEvent)
		return () => {
			window.matrixClient.removeListener(RoomEvent.Timeline, onNewEvent)
		}
	})
</script>

<ol class="timeline">
	<div style:margin-top="auto"></div>
	{#each timeline as event, i}
		<Event {event} nextEvent={timeline[i + 1]} lastEvent={timeline[i - 1]} />
	{/each}
</ol>

<style>
	.timeline {
		display: flex;
		flex-direction: column;
		max-width: 60rem;
		margin: 0 auto;
		list-style: none;
		padding: 0.5rem;
		word-break: break-word;
	}
</style>
