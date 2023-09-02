<script lang="ts">
	import { fly, fade } from 'svelte/transition'
	import { expoOut } from 'svelte/easing'
	import CloseIcon from '$lib/Icons/close.svg?c'
	import { focusTrap } from 'svelte-focus-trap'
	import { mobile } from '$lib/stores'
	import { onMount } from 'svelte'
	import Portal from 'svelte-portal'
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'
	const hasDialog: Writable<boolean> = getContext('hasDialog')

	let visible = false

	export let updateStore = true
	export let closeDialog: (() => void) | null = null
	function clickOff(event: Event) {
		if (!closeDialog) return
		if ((<HTMLElement | null>event.target)?.closest('.dialog')) return
		visible = false
	}

	$: {
		if (updateStore) hasDialog.set(visible)
	}

	onMount(() => {
		visible = true
		return () => (visible = false)
	})
</script>

{#if visible}
	<Portal target="#dialogs">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="dialog-wrapper"
			out:fade={$mobile
				? { delay: 200, duration: 50, easing: expoOut }
				: { duration: 200, easing: expoOut }}
			in:fade={$mobile ? { duration: 0 } : { duration: 200, easing: expoOut }}
			on:outrostart
			on:outroend={closeDialog}
			on:click={clickOff}
		>
			<div
				class="dialog"
				use:focusTrap
				on:introend
				transition:fly={$mobile
					? { y: 0, x: '-100%', duration: 500, opacity: 1, easing: expoOut }
					: { y: 10, duration: 200, easing: expoOut }}
			>
				<div class="heading">
					<slot name="heading">
						<h1 class="title"><slot name="title" /></h1>
						{#if closeDialog}
							<button class="close" on:click={() => (visible = false)}>
								<span class="sr-only">Close</span>
								<CloseIcon aria-hidden="true"></CloseIcon>
							</button>
						{/if}
					</slot>
				</div>
				<slot name="content">
					<div class="content">
						<slot />
					</div>
				</slot>
			</div>
		</div>
	</Portal>
{/if}

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
			place-content: unset;
			background: none;
		}
		.dialog {
			max-width: unset;
			border-radius: 0;
			box-shadow: 0 0 4rem 2rem rgb(0 0 0 / 0.25);
		}
	}
</style>
