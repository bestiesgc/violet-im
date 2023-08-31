<script lang="ts">
	import client from '$lib/client/index'
	import DOMPurify from 'dompurify'
	export let body: string
	export let allEmoji = false
	function linkPrettier(url: string) {
		return url.replace(/^[a-zA-Z]+?:\/\//, '').replace(/\/$/, '')
	}
	function parseBody(body: string) {
		const parser = new DOMParser()
		const bodyDoc = parser.parseFromString(body, 'text/html')
		let isAllEmoji = false
		bodyDoc.querySelectorAll('img[data-mx-emoticon]').forEach(img => {
			isAllEmoji = true
			img.classList.add('emoji')
			img.removeAttribute('width')
			img.removeAttribute('height')
			let src = img.getAttribute('src')
			if (!src) throw new Error('Invalid img tag')
			if (src.startsWith('mxc://')) src = client.matrixClient.mxcUrlToHttp(src)
			if (!src) throw new Error('Invalid img url')
			img.setAttribute('src', src)
		})
		bodyDoc.querySelectorAll('style, script').forEach(el => {
			el.replaceWith(el.outerHTML)
		})
		bodyDoc.querySelectorAll('mx-reply').forEach(reply => {
			reply.remove()
		})
		bodyDoc.querySelectorAll('a').forEach(a => {
			a.setAttribute('target', '_blank')
			a.setAttribute('rel', 'noopener noreferrer')
			if (a.innerText != a.getAttribute('href')) {
				const text = a.innerText
				a.innerText = linkPrettier(a.getAttribute('href') ?? '')
				a.replaceWith('[' + text + '](', a, ')')
			} else {
				a.innerText = linkPrettier(a.getAttribute('href') ?? '')
			}
		})
		bodyDoc.body.childNodes.forEach(node => {
			if (node.nodeName != 'IMG') {
				isAllEmoji = false
			}
		})
		if (isAllEmoji) {
			bodyDoc.querySelectorAll('img:not(.emoji)').forEach(img => {
				isAllEmoji = false
			})
		}
		allEmoji = isAllEmoji
		return DOMPurify.sanitize(bodyDoc.body.innerHTML, {
			FORBID_TAGS: ['style']
		}).trim()
	}
	$: cleanBody = parseBody(body)
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
