<script lang="ts">
	import { fly, fade } from 'svelte/transition'
	import { expoOut } from 'svelte/easing'
	import CloseIcon from '$lib/Icons/close.svg?c'
	import { focusTrap } from 'svelte-focus-trap'
	export let closeDialog: (() => void) | null = null
	function clickOff(event: Event) {
		if (!closeDialog) return
		if ((<HTMLElement | null>event.target)?.closest('.dialog')) return
		closeDialog()
	}
	let innerWidth: number = window.innerWidth
	let mobile = true
	$: mobile = innerWidth <= 600
</script>

<svelte:window bind:innerWidth />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="dialog-wrapper"
	out:fade={mobile
		? { delay: 250, duration: 250, easing: expoOut }
		: { duration: 200, easing: expoOut }}
	in:fade={mobile ? { duration: 0 } : { duration: 200, easing: expoOut }}
	on:click={clickOff}
>
	<div
		class="dialog"
		use:focusTrap
		transition:fly={mobile
			? { y: 0, x: '-100%', duration: 500, opacity: 1, easing: expoOut }
			: { y: 10, duration: 200, easing: expoOut }}
	>
		<div class="heading">
			<slot name="heading">
				<h1 class="title"><slot name="title" /></h1>
				{#if closeDialog}
					<button class="close" on:click={closeDialog}>
						<span class="sr-only">Close</span>
						<CloseIcon aria-hidden="true"></CloseIcon>
					</button>
				{/if}
			</slot>
		</div>
		<div class="content">
			<slot />
		</div>
	</div>
</div>

<style lang="postcss">
	.dialog-wrapper {
		z-index: 999;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		backdrop-filter: blur(4px);
		background-color: rgb(0 0 0 / 0.25);
		display: grid;
		place-content: center;
	}
	.dialog {
		position: relative;
		box-shadow: 0 0 0.5rem rgb(0 0 0 / 0.25);
		background-color: var(--slate-900);
		border-radius: 0.25rem;
		overflow: hidden;
		max-width: 60rem;
	}
	.heading {
		display: grid;
		grid-template-columns: 1fr 1.5rem;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: 600;
		border-bottom: 1px solid var(--slate-800);
		padding: 0.75rem 0.5rem;
	}
	.dialog :global(h1) {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0.5rem 0;
	}
	.dialog :global(h2) {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0.5rem 0;
	}
	.dialog :global(h3) {
		font-size: 1rem;
		font-weight: 700;
		margin: 0.5rem 0;
	}
	.title {
		margin: 0 !important;
		user-select: none;
		line-height: 1;
	}
	.close {
		display: grid;
		place-content: center;
		width: 1.5rem;
		height: 1.5rem;
	}
	.content {
		padding: 0.75rem 0.5rem;
		height: 100%;
	}
	@media screen and (max-width: 600px) {
		.dialog-wrapper {
			backdrop-filter: none;
			place-items: unset;
			background: none;
		}
		.dialog {
			max-width: unset;
			border-radius: 0;
			box-shadow: 0 0 4rem 2rem rgb(0 0 0 / 0.25);
		}
	}
</style>
