<script lang="ts">
	import { fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	export let visible = false
	const dispatcher = createEventDispatcher()

	let position = { x: 0, y: 0 }
	let borderBoxSize: ResizeObserverSize[]

	$: {
		if (borderBoxSize) {
			console.log('content box!', borderBoxSize)
		}
	}

	function onClickOff(e: MouseEvent) {
		if (!(e.target instanceof HTMLElement)) {
			return
		}
		if (e.target.closest('.context')) {
			return
		}
		dispatcher('escape')
	}
</script>

<div
	class="context-wrapper"
	role="article"
	on:contextmenu={e => {
		e.preventDefault()
		position = { x: e.clientX, y: e.clientY }
		dispatcher('contextmenu')
	}}
>
	<slot />
	{#if visible}
		<div
			bind:borderBoxSize
			transition:fly={{ y: 2, duration: 100 }}
			class="contextmenu"
			style:--x="{position.x}px"
			style:--y="{position.y}px"
			style:--width="{borderBoxSize?.[borderBoxSize.length - 1]?.inlineSize}px"
			style:--height="{borderBoxSize?.[borderBoxSize.length - 1]?.blockSize}px"
		>
			<slot name="contextmenu" />
		</div>
	{/if}
</div>

<svelte:window on:click={onClickOff} />

<style>
	.contextmenu {
		width: var(--width, max-content);
		display: grid;
		background-color: var(--slate-950);
		padding: 0.25rem 0.25rem;
		border-radius: 0.25rem;
		position: fixed;
		z-index: 9999;
		left: var(--x);
		left: min(var(--x), 100vw - var(--width) - 1rem);
		top: var(--y);
		top: min(var(--y), 100vh - var(--height) - 1rem);
	}
	.contextmenu :global(button) {
		border-radius: 0.125rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.125rem 0.25rem;
		gap: 1rem;
	}
	.contextmenu :global(button:hover) {
		background-color: var(--slate-900);
	}
	.contextmenu :global(button svg) {
		width: 1.125rem;
	}
</style>
