<script>
	export let action = ''
</script>

<form {action} on:submit>
	<slot />
</form>

<style lang="postcss">
	form {
		display: grid;
		gap: 0.5rem;
	}
	form :global(button[type='submit']) {
		margin-top: 0.5rem;
		margin-inline-start: auto;
	}
</style>
