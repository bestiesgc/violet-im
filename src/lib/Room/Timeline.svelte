<script>
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'
	import client from '$lib/client/index.js'
	import Event from '$lib/Event/Event.svelte'

	export let room

	let timelineElement
	const activeTimeline = room.getLiveTimeline()
	const timeline = activeTimeline.events
	let wrappedTimeline = []

	function onTimeline() {
		client.wrapTimeline(timeline, room).then(timeline => {
			wrappedTimeline = timeline
		})
	}

	async function loadPrevious(limit) {
		oldestMessageId = timeline[0].getId()
		function getFirstLinkedTimeline() {
			let tl = activeTimeline
			while (tl?.getNeighbouringTimeline('b')) {
				tl = tl.getNeighbouringTimeline('b')
			}
			return tl
		}
		await client.matrixClient.paginateEventTimeline(
			getFirstLinkedTimeline(timeline),
			{
				backwards: true,
				limit
			}
		)
		onTimeline()
	}

	function onScroll(event) {
		shouldScroll =
			timelineElement.scrollTop + timelineElement.offsetHeight ==
			timelineElement.scrollHeight
		if (timelineElement?.scrollTop <= 100) loadPrevious()
	}

	onTimeline()

	let oldestMessageId = timeline[0].getId()
	let scrollPosition
	let scrollHeight
	let shouldScroll = true

	beforeUpdate(() => {
		if (timelineElement) {
			scrollPosition = timelineElement.scrollTop
			scrollHeight = timelineElement.scrollHeight
		}
	})

	afterUpdate(() => {
		if (shouldScroll) {
			timelineElement.scrollTop = timelineElement.scrollHeight
		} else {
			if (timeline[0].getId() != oldestMessageId) {
				timelineElement.scrollTop =
					scrollPosition + (timelineElement.scrollHeight - scrollHeight)
			}
		}
	})

	onMount(() => {
		loadPrevious(20).then(() => {
			shouldScroll = true
		})
		room.on('Room.timeline', onTimeline)
		return () => {
			room.off('Room.timeline', onTimeline)
		}
	})
</script>

<ol class="timeline scroller" bind:this={timelineElement} on:scroll={onScroll}>
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
