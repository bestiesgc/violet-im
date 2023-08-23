<script>
	import client from '$lib/client/index.js'
	import DOMPurify from 'dompurify'
	export let body
	export let allEmoji = false
	function parseBody(body) {
		const parser = new DOMParser()
		const bodyDoc = parser.parseFromString(body, 'text/html')
		let isAllEmoji = false
		bodyDoc.querySelectorAll('img[data-mx-emoticon]').forEach(img => {
			isAllEmoji = true
			img.classList.add('emoji')
			img.removeAttribute('width')
			img.removeAttribute('height')
			img.src = client.matrixClient.mxcUrlToHttp(img.src)
		})
		bodyDoc.querySelectorAll('mx-reply').forEach(reply => {
			reply.remove()
		})
		bodyDoc.body.childNodes.forEach(node => {
			if (node.nodeName != 'IMG' || !node.classList.contains('emoji')) {
				isAllEmoji = false
			}
		})
		if (isAllEmoji) {
			allEmoji = true
			bodyDoc.querySelectorAll('img.emoji').forEach(img => {
				img.classList.add('big-emoji')
			})
		}
		return DOMPurify.sanitize(bodyDoc.body.innerHTML)
	}
	$: cleanBody = parseBody(body)
</script>

{#if cleanBody}
	<div class="body">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html cleanBody}
	</div>
{/if}

<style>
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
