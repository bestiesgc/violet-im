<script lang="ts">
	import { isAllEmoji, parseBody } from './body-cleanup'

	export let body: string
	export let allEmoji = false

	let cleanBody: string

	$: {
		cleanBody = parseBody(body)
		allEmoji = isAllEmoji(cleanBody)
	}
</script>

{#if cleanBody}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="body">{@html cleanBody}</div>
{/if}

<style>
	.body,
	.body :global(pre) {
		word-break: break-word;
		white-space: pre-wrap;
	}
	.body :global(.emoji) {
		display: inline;
		vertical-align: middle;
		height: 1.5em;
		width: 1.5em;
	}
</style>
