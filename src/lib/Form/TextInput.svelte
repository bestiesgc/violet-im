<script>
	export let type = 'text'
	export let label
	export let value
	export let placeholder = null
</script>

<label>
	<span>{label}</span>
	{#if type == 'text'}
		<input type="text" {placeholder} bind:value />
	{:else}
		<input type="password" bind:value />
	{/if}
</label>

<style lang="postcss">
	label {
		display: grid;
		grid-template-rows: min-content 1fr;
		gap: 0.125em;
	}
	span {
		user-select: none;
		font-size: 0.8em;
	}
	input {
		padding: 0.25em 0.5em;
		border-radius: 0.25em;
		min-width: 0;
		border: 1px solid var(--slate-950);
		background-color: var(--slate-950);
		color: var(--slate-200);
	}
	input::placeholder {
		color: var(--slate-500);
		opacity: 0.5;
	}
</style>
