<script>
	import client from '$lib/client/index.js'
	export let event

	function convertRemToPixels(rem) {
		return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
	}

	let attachmentUrl
	$: loadAttachment(event)

	function loadAttachment() {
		client.getAttachment(event).then(url => {
			attachmentUrl = url
		})
	}

	const maxWidth = convertRemToPixels(20)
</script>

{#if !attachmentUrl}
	<div
		class="attachment loading"
		style:width={Math.min(event.content.info.w, maxWidth)}
		style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
	></div>
{:else}
	<img
		width={Math.min(event.content.info.w, maxWidth)}
		style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
		src={attachmentUrl}
		alt=""
		class="attachment"
	/>
{/if}

<style lang="postcss">
	.attachment {
		max-width: 100%;
	}
</style>
