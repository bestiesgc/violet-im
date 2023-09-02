<script lang="ts">
	import type { WrappedEvent } from '$lib/client/event'
	import convertRemToPixels from '$lib/utils/rem'
	import client from '$lib/client/index'
	export let event: WrappedEvent

	let attachmentUrl: string
	$: event && loadAttachment()

	function loadAttachment() {
		client.getAttachment(event).then(url => {
			attachmentUrl = url
		})
	}

	const maxWidth = convertRemToPixels(20)
</script>

{#if event.content}
	{#if !attachmentUrl}
		<div
			class="attachment loading"
			style:width={Math.min(event.content.info.w, maxWidth) + 'px'}
			style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
		></div>
	{:else}
		<img
			loading="lazy"
			width={Math.min(event.content.info.w, maxWidth)}
			style:aspect-ratio="{event.content.info.w} / {event.content.info.h}"
			src={attachmentUrl}
			alt=""
			class="attachment"
		/>
	{/if}
{/if}

<style lang="postcss">
	.attachment {
		max-width: 100%;
	}
</style>
