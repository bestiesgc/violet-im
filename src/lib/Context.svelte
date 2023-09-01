<script lang="ts">
	import { fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	export let visible = false
	const dispatcher = createEventDispatcher()

	let position = { x: 0, y: 0 }

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
			transition:fly={{ y: 2, duration: 100 }}
			class="contextmenu"
			style:--x="{position.x}px"
			style:--y="{position.y}px"
		>
			<slot name="contextmenu" />
		</div>
	{/if}
</div>

<svelte:window on:click={onClickOff} />

<style>
	.contextmenu {
		width: 8rem;
		display: grid;
		background-color: var(--slate-950);
		padding: 0.25rem 0.25rem;
		border-radius: 0.25rem;
		position: fixed;
		z-index: 9999;
		left: var(--x);
		left: min(var(--x), calc(100vw - 9rem));
		top: var(--y);
	}
	.contextmenu :global(button) {
		border-radius: 0.125rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.125rem 0.25rem;
		gap: 0.25rem;
	}
	.contextmenu :global(button:hover) {
		background-color: var(--slate-900);
	}
	.contextmenu :global(button svg) {
		width: 1.125rem;
	}
</style>
