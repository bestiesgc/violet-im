<script>
	import { fly } from 'svelte/transition'
	export let number
</script>

<span class="ticker">
	<span class="sr-only">{number}</span>
	<span aria-hidden="true" class="real">{number}</span>
	{#key number}
		<span
			aria-hidden="true"
			class="animated"
			in:fly={{ duration: 200, y: -10 }}
			out:fly={{ duration: 200, y: 10 }}>{number}</span
		>
	{/key}
</span>

<style>
	.ticker {
		position: relative;
		display: inline-block;
		vertical-align: middle;
	}

	.real {
		visibility: hidden;
	}

	.ticker > .animated {
		position: absolute;
		inset: 0;
	}
</style>
