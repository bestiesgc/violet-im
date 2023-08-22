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
		console.log(bodyDoc.body.innerHTML)
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
		height: 1.5em;
		width: 1.5em;
	}
	:global(.emoji:only-child) {
		height: 2.5em;
		width: 2.5em;
	}
</style>
