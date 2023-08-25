<script>
	export let joinLast = false
	export let joinNext = false
	export let rightSide = false
	export let noPadding = false
</script>

<div class="bubble-wrapper" class:right-side={rightSide}>
	{#if !joinNext}
		<svg
			class="svg-appendix"
			fill="currentColor"
			xml:space="preserve"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 7 17"
			><path
				d="M1 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 0 0 1 17z"
			></path></svg
		>
	{/if}
	<div
		class="bubble"
		class:no-padding={noPadding}
		class:join-last={joinLast}
		class:join-next={joinNext}
	>
		<slot />
	</div>
</div>

<style>
	.bubble-wrapper {
		position: relative;
		width: fit-content;
		max-width: min(100%, 40rem);
	}
	.bubble {
		overflow: hidden;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
	}
	.bubble-wrapper .svg-appendix {
		color: var(--slate-800);
		position: absolute;
		bottom: 0;
		left: -0.25rem;
		width: 0.25rem;
	}
	.bubble-wrapper.right-side .bubble {
		background-color: var(--slate-700);
	}
	.bubble-wrapper.right-side .svg-appendix {
		color: var(--slate-700);
		left: unset;
		right: -0.25rem;
		transform: scaleX(-1);
	}
	.bubble.no-padding {
		padding: 0;
	}
	.bubble-wrapper:not(.right-side) .join-last {
		border-top-left-radius: 0;
	}
	.bubble-wrapper:not(.right-side) .bubble {
		border-bottom-left-radius: 0;
	}
	.bubble-wrapper.right-side {
		margin-inline-start: auto;
	}
	.bubble-wrapper.right-side .join-last {
		border-top-right-radius: 0;
	}
	.bubble-wrapper.right-side .bubble {
		border-bottom-right-radius: 0;
	}
</style>
