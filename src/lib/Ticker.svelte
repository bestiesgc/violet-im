<script lang="ts">
	import { fly } from 'svelte/transition'
	export let number: number | string
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

<style lang="postcss">
	.ticker {
		position: relative;
		display: inline-block;
	}

	.real {
		visibility: hidden;
	}

	.ticker > .animated {
		position: absolute;
		inset: 0;
	}
</style>
