<script>
	import client from '$lib/client/index.js'
	export let event

	function convertRemToPixels(rem) {
		return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
	}

	const maxWidth = convertRemToPixels(20)
	// const maxHeight = convertRemToPixels(40)
</script>

{#await client.getAttachment(event)}
	<div
		class="attachment loading"
		style:width={Math.min(event.content.info.w, maxWidth)}
		style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
	></div>
{:then attachmentUrl}
	<img
		width={Math.min(event.content.info.w, maxWidth)}
		style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
		src={attachmentUrl}
		alt=""
		class="attachment"
	/>
{/await}

<style lang="postcss">
	.attachment {
		max-width: 100%;
	}
</style>
