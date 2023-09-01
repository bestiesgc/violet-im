<script lang="ts">
	import client from '$lib/client/index'
	import Context from '$lib/Context.svelte'
	import Dialog from '$lib/Dialogs/Wrapper.svelte'
	import DeleteIcon from '$lib/Icons/delete.svg?c'
	import CodeIcon from '$lib/Icons/code.svg?c'
	import EditIcon from '$lib/Icons/edit.svg?c'
	import ReplyIcon from '$lib/Icons/reply.svg?c'
	import type { WrappedEvent, WrappedMessageEvent } from '$lib/client/event.js'
	import type { Writable } from 'svelte/store'
	import { tap, holdtap } from '../actions/tap.js'
	import Message from './Message.svelte'
	import { getContext } from 'svelte'
	import highlight from '$lib/utils/highlight.js'
	import { finePointer } from '$lib/stores.js'
	const editingOrReplying: Writable<'editing' | 'replying' | null> =
		getContext('editingOrReplying')

	const selection: Writable<WrappedEvent[] | null> = getContext('selection')

	let eventElement: HTMLElement

	export let event: WrappedEvent
	export let lastEvent: WrappedEvent | null
	export let nextEvent: WrappedEvent | null

	let messageEvent = <WrappedMessageEvent>event

	let viewSource = false

	$: isSelected =
		$selection &&
		($selection?.includes(event) ||
			$selection?.findIndex(e => e.id === event.id) !== -1)

	function updateSelection(touchEvent?: Event) {
		if ($editingOrReplying) return
		if ((<Element | null>touchEvent?.target)?.closest('button') != null) return
		if (!$selection) {
			$selection = [event]
		} else {
			if (isSelected) {
				$selection = $selection.filter(e => e.id !== event.id)
				if ($selection.length === 0) $selection = null
			} else {
				$selection = [...$selection, event]
			}
		}
	}
</script>

<Context
	visible={$finePointer ? isSelected ?? false : false}
	on:contextmenu={() => {
		if (!$finePointer) return
		$selection = [event]
	}}
	on:escape={() => {
		if (!$finePointer) return
		$selection = null
	}}
>
	<div
		class="event-wrapper"
		class:selected={!$finePointer && isSelected}
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
			<div class="options">
				<button on:click={() => ($editingOrReplying = 'replying')}>
					<span class="sr-only">Reply</span>
					<ReplyIcon aria-hidden="true"></ReplyIcon>
				</button>
				<button on:click={() => client.deleteEvent(event)}>
					<span class="sr-only">Delete</span>
					<DeleteIcon aria-hidden="true"></DeleteIcon>
				</button>
			</div>
		</div>
	</div>
	<svelte:fragment slot="contextmenu">
		<button
			on:click={() => {
				$selection = [event]
				$editingOrReplying = 'replying'
			}}
		>
			<span>Reply</span>
			<ReplyIcon aria-hidden="true"></ReplyIcon>
		</button>
		<button
			on:click={() => {
				$selection = [event]
				$editingOrReplying = 'editing'
			}}
		>
			<span>Edit</span>
			<EditIcon aria-hidden="true"></EditIcon>
		</button>
		<button on:click={() => client.deleteEvent(event)}>
			<span>Delete</span>
			<DeleteIcon aria-hidden="true"></DeleteIcon>
		</button>
		<button on:click={() => (viewSource = true)}>
			<span>View Source</span>
			<CodeIcon aria-hidden="true"></CodeIcon>
		</button>
	</svelte:fragment>
</Context>

{#if viewSource}
	<Dialog closeDialog={() => (viewSource = false)}>
		<span slot="title">View Source</span>
		{#if event._debug.isEncrypted()}
			{#await highlight('json', JSON.stringify(event._debug.getEffectiveEvent(), null, '\t'))}
				<pre>{@html event._debug.getEffectiveEvent()}</pre>
			{:then highlighted}
				<pre>{@html highlighted}</pre>
			{/await}
		{:else}
			{#await highlight('json', JSON.stringify(event._debug.event, null, '\t'))}
				<pre>{@html event._debug.event}</pre>
			{:then highlighted}
				<pre>{@html highlighted}</pre>
			{/await}
		{/if}
	</Dialog>
{/if}

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
	.options {
		margin-inline-end: 0.25rem;
		padding: 0rem 0.25rem;
		border-radius: 0.25rem;
		background-color: var(--slate-950);
		display: none;
		align-items: center;
		right: 0;
		top: 0;
		transform: translateY(-50%);
		position: absolute;
		z-index: 99;
	}
	.options button {
		display: grid;
		place-items: center;
	}
	@media (pointer: fine) {
		.event-wrapper:hover {
			background-color: #a1a2d310;
		}
		.event:hover .options,
		.options:focus-within {
			display: flex;
		}
	}
</style>
