<script>
	import client from '$lib/client/index.js'
	import DOMPurify from 'dompurify'
	export let body
	let cleanBody
	function parseBody(body) {
		const parser = new DOMParser()
		const bodyDoc = parser.parseFromString(body, 'text/html')
		bodyDoc.querySelectorAll('img[data-mx-emoticon]').forEach(img => {
			img.classList.add('emoji')
			img.removeAttribute('width')
			img.removeAttribute('height')
			img.src = client.matrixClient.mxcUrlToHttp(img.src)
		})
		bodyDoc.querySelectorAll('mx-reply').forEach(reply => {
			reply.remove()
		})
		cleanBody = DOMPurify.sanitize(bodyDoc.body.innerHTML)
	}
	$: parseBody(body)
</script>

{#if cleanBody}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html cleanBody}
{/if}

<style>
	:global(.emoji) {
		display: inline;
		vertical-align: middle;
		height: 1.5em;
		width: 1.5em;
	}
</style>
