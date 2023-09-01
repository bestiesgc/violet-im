<script lang="ts">
	import { isAllEmoji, parseBody } from './body-cleanup'

	export let body: string
	export let inline = false
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
	<div class="body" class:inline>
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
		display: block;
		overflow-x: auto;
		padding: 0.5em;
		border-radius: 0.25rem;
		color: #b7bec9;
		background: #262729;
	}
	.body :global(.mention),
	.body :global(a) {
		color: var(--violet-400);
		text-decoration: none;
	}
	.body :global(a:hover) {
		text-decoration: underline;
	}
	.body :global(.mention span:not(.name)) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
	.body :global(blockquote) {
		padding: 0;
		margin: 0;
		background: none;
	}
	.body:not(.inline) :global(blockquote) {
		background-color: var(--slate-900);
		position: relative;
		white-space: normal;
		padding-inline: 0.5rem;
		padding-block: 0.25rem;
		border-end-end-radius: 0.25rem;
		border-start-end-radius: 0.25rem;
	}
	.body:not(.inline) :global(blockquote::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0.125rem;
		border-radius: 0.5rem;
		background-color: var(--slate-500);
	}
	.body.inline :global(*) {
		display: inline;
	}
	.body.inline :global(br) {
		display: none;
	}
	.body :global(.emoji) {
		display: inline;
		vertical-align: middle;
		height: 1.5em;
		width: 1.5em;
	}
</style>
