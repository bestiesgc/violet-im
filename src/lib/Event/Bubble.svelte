<script>
	export let joinLast = false
	export let joinNext = false
	export let rightSide = false
</script>

<div
	class="bubble"
	class:right-side={rightSide}
	class:join-last={joinLast}
	class:join-next={joinNext}
>
	<slot />
</div>

<style>
	.bubble {
		width: fit-content;
		max-width: min(100%, 40rem);
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
	}
	.bubble:not(.right-side).join-last {
		border-top-left-radius: 0;
	}
	.bubble:not(.right-side).join-next {
		border-bottom-left-radius: 0;
	}
	.bubble.right-side {
		margin-inline-start: auto;
	}
	.bubble.right-side.join-last {
		border-top-right-radius: 0;
	}
	.bubble.right-side.join-next {
		border-bottom-right-radius: 0;
	}
</style>
