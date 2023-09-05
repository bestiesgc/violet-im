<script lang="ts">
	import {
		Direction,
		RoomEvent,
		type EventTimeline,
		type Room
	} from 'matrix-js-sdk'
	import { afterUpdate, beforeUpdate, onMount } from 'svelte'
	import client from '$lib/client/index'
	import Event from '$lib/Event/Event.svelte'
	import type { WrappedEvent } from '$lib/client/event'
	import MemberAvatar from '$lib/Member/Avatar.svelte'

	export let room: Room

	let timelineElement: HTMLElement
	let timelineHeight: number
	$: {
		if (timelineElement && timelineHeight) updateScrollPosition()
	}
	const activeTimeline = room.getLiveTimeline()
	const timeline = activeTimeline.getEvents()
	let wrappedTimeline: WrappedEvent[] = []

	$: {
		if (room) {
			loadTimeline(20, true)
		}
	}

	async function onTimeline() {
		wrappedTimeline = await client.wrapTimeline(timeline, room)
	}

	async function loadTimeline(limit = 20, backwards = false) {
		function getFirstLinkedTimeline() {
			let tl: EventTimeline | null = activeTimeline
			const direction = backwards ? Direction.Backward : Direction.Forward
			while (tl?.getNeighbouringTimeline(direction)) {
				tl = tl.getNeighbouringTimeline(direction)
			}
			return tl
		}
		const tl = getFirstLinkedTimeline()
		if (tl) {
			await client.matrixClient.paginateEventTimeline(tl, {
				backwards,
				limit
			})
		}
		onTimeline()
	}

	let hasLoaded = false

	function onScroll() {
		if (!hasLoaded) return
		shouldScroll =
			Math.abs(
				timelineElement.scrollTop +
					timelineElement.offsetHeight -
					timelineElement.scrollHeight
			) < 10
		scrollPosition = timelineElement.scrollTop
		if (timelineElement?.scrollTop <= 100) loadTimeline(20, true)
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

	function updateScrollPosition() {
		if (!timelineElement) return
		if (shouldScroll) {
			timelineElement.scrollTop = timelineElement.scrollHeight
		} else {
			if (timeline[0].getId() != oldestMessageId) {
				timelineElement.scrollTop =
					scrollPosition + (timelineElement.scrollHeight - scrollHeight)
			} else {
				timelineElement.scrollTop =
					timelineElement.scrollHeight - (scrollHeight - scrollPosition)
			}
		}
	}

	afterUpdate(() => {
		updateScrollPosition()
		oldestMessageId = timeline[0].getId()
		hasLoaded = true
	})

	onMount(() => {
		room.on(RoomEvent.Timeline, onTimeline)
		room.on(RoomEvent.Receipt, onTimeline)
		return () => {
			room.off(RoomEvent.Timeline, onTimeline)
			room.off(RoomEvent.Receipt, onTimeline)
		}
	})
</script>

<svelte:window on:resize={updateScrollPosition} />

<ol
	class="timeline scroller"
	bind:this={timelineElement}
	bind:clientHeight={timelineHeight}
	on:scroll={onScroll}
>
	<li style:margin-top="auto"></li>
	{#each wrappedTimeline as event, i (event.id)}
		<li>
			<Event
				{event}
				nextEvent={client.getNextMessageEvent(wrappedTimeline, i) ?? null}
				lastEvent={client.getLastMessageEvent(wrappedTimeline, i) ?? null}
			/>
			{#if event.receipts.length > 0}
				<div class="receipts">
					{#each event.receipts as receipt}
						<div class="receipt" title="Read by {receipt.name}">
							<MemberAvatar member={receipt}></MemberAvatar>
						</div>
					{/each}
				</div>
			{/if}
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
		transition: padding-bottom 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.receipts {
		padding: 0 0.5rem;
		max-width: 60rem;
		margin: 0 auto;
		display: flex;
		justify-content: flex-end;
		margin-block: 0.25rem;
		height: 1.25rem;
	}
	.receipts :global(.avatar) {
		border-radius: 100%;
		height: 1.25rem;
		width: 1.25rem;
	}
</style>
