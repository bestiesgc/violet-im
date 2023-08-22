<script>
	export let type
</script>

<button {type}>
	<slot />
</button>

<style>
	button {
		padding: 0.25em 0.5em;
		border-radius: 0.25em;
		text-align: center;
		color: var(--slate-950);
		background-color: var(--violet-400);
		transition: background-color 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	button:hover {
		background-color: var(--violet-500);
	}
</style>
