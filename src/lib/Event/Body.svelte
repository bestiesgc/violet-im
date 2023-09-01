<script lang="ts">
	import { isAllEmoji, parseBody } from './body-cleanup'

	export let body: string
	export let allEmoji = false

	let parsedBody: {
		text: string
		codePromise: Promise<string> | null
	}

	$: {
		parsedBody = parseBody(body)
		allEmoji = isAllEmoji(parsedBody.text)
	}
</script>

{#if parsedBody}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="body">
		{#if parsedBody.codePromise}{#await parsedBody.codePromise}{@html parsedBody.text}{:then html}{@html html}{/await}{:else}{@html parsedBody.text}{/if}
	</div>
{/if}

<style>
	.body,
	.body :global(pre) {
		word-break: break-word;
		white-space: pre-wrap;
	}
	.body :global(pre) {
		margin: 0;
	}
	.body :global(pre code) {
		padding: 0.5em;
		border-radius: 0.25rem;
	}
	.body :global(.emoji) {
		display: inline;
		vertical-align: middle;
		height: 1.5em;
		width: 1.5em;
	}
</style>
