<script lang="ts">
	import type { EventTimeline, Room } from 'matrix-js-sdk'
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'
	import client from '$lib/client/index'
	import Event from '$lib/Event/Event.svelte'
	import type { WrappedEvent } from '$lib/client/event'

	export let room: Room

	let timelineElement: HTMLElement
	const activeTimeline = room.getLiveTimeline()
	const timeline = activeTimeline.getEvents()
	let wrappedTimeline: WrappedEvent[] = []

	async function onTimeline() {
		wrappedTimeline = await client.wrapTimeline(timeline, room)
	}

	async function loadPrevious(limit = 20) {
		oldestMessageId = timeline[0].getId()
		function getFirstLinkedTimeline() {
			let tl: EventTimeline | null = activeTimeline
			while (tl?.getNeighbouringTimeline(client.matrixSdk.Direction.Backward)) {
				tl = tl.getNeighbouringTimeline(client.matrixSdk.Direction.Backward)
			}
			return tl
		}
		const tl = getFirstLinkedTimeline()
		if (tl) {
			await client.matrixClient.paginateEventTimeline(tl, {
				backwards: true,
				limit
			})
		}
		onTimeline()
	}

	let hasLoaded = false

	function onScroll() {
		if (!hasLoaded) return
		shouldScroll =
			timelineElement.scrollTop + timelineElement.offsetHeight ==
			timelineElement.scrollHeight
		if (timelineElement?.scrollTop <= 100) loadPrevious()
	}

	let oldestMessageId = timeline[0].getId()
	let scrollPosition: number
	let scrollHeight: number
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
		hasLoaded = true
	})

	onMount(() => {
		loadPrevious(20)
		room.on(client.matrixSdk.RoomEvent.Timeline, onTimeline)
		return () => {
			room.off(client.matrixSdk.RoomEvent.Timeline, onTimeline)
		}
	})
</script>

<ol class="timeline scroller" bind:this={timelineElement} on:scroll={onScroll}>
	<div style:margin-top="auto"></div>
	{#each wrappedTimeline as event, i (event.id)}
		<li>
			<Event
				{event}
				nextEvent={client.getNextMessageEvent(wrappedTimeline, i) ?? null}
				lastEvent={client.getLastMessageEvent(wrappedTimeline, i) ?? null}
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
