<script>
	import {
		decryptTimeline,
		getNextMessageEvent,
		getLastMessageEvent
	} from '$lib/client/index.js'
	import Event from '$lib/Event/Event.svelte'

	export let room
	$: timeline = room.getLiveTimeline().events
</script>

<ol class="timeline scroller">
	<div style:margin-top="auto"></div>
	{#await decryptTimeline(timeline) then timeline}
		{#each timeline as event, i}
			<li>
				<Event
					{event}
					nextEvent={getNextMessageEvent(timeline, i)}
					lastEvent={getLastMessageEvent(timeline, i)}
				/>
			</li>
		{/each}
	{/await}
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
