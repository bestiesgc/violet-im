<script lang="ts">
	import client from '$lib/client/index'
	import Timeline from '$lib/Room/Timeline.svelte'
	import Textarea from '$lib/GrowingTextarea.svelte'
	import CloseIcon from '$lib/Icons/close.svg?c'
	import SendIcon from '$lib/Icons/send.svg?c'
	import * as marked from 'marked'
	import type { IContent } from 'matrix-js-sdk'
	import { decodeEntities, escape } from '$lib/utils/escape'
	import { getContext } from 'svelte'
	import { finePointer } from '$lib/stores.js'
	import type { Writable } from 'svelte/store'
	import type { WrappedEvent } from '$lib/client/event'
	const editingOrReplying: Writable<'editing' | 'replying' | null> =
		getContext('editingOrReplying')
	const selection: Writable<WrappedEvent[] | null> = getContext('selection')

	export let data

	let message: string

	async function sendMessage() {
		if (!data.roomId) throw new Error('Not in room')
		if (message.startsWith('/html')) {
			const body = message.replace('/html', '').trim()
			message = ''
			const content: IContent = {
				msgtype: 'm.text',
				body,
				format: 'org.matrix.custom.html',
				formatted_body: body
			}
			await client.matrixClient.sendMessage(data.roomId, content)
			return
		}
		const body = message.trim()
		message = ''
		let formattedBody = escape(body).replace(
			/(\n|^)(>[^\s].*(?:\n>[^\s].*)*)/gm,
			(_, p1, p2) => {
				return `${p1}<font color="#e574ff">${escape(p2).replace(
					/\n/gm,
					'<br>'
				)}</font>`
			}
		)
		let parser: any = marked.parseInline
		if (/(^|\n)```[a-z]+\n.*?```/s.test(body)) {
			parser = marked.parse
		}
		let markedResult = await parser(formattedBody, {
			async: true
		})
		if (markedResult) {
			formattedBody = markedResult
		}
		const content: IContent = {
			msgtype: 'm.text',
			body
		}
		if ($editingOrReplying) {
			if ($editingOrReplying == 'editing') {
				content['m.new_content'] = { ...content }
				content['m.relates_to'] = {
					event_id: $selection?.[0].id,
					rel_type: 'm.replace'
				}
			} else {
				content['m.relates_to'] = {
					'm.in_reply_to': {
						event_id: $selection?.[0].id
					}
				}
			}
			$selection = null
			$editingOrReplying = null
		}
		if (formattedBody != body && decodeEntities(formattedBody) != body) {
			content.format = 'org.matrix.custom.html'
			content.formatted_body = formattedBody
		}
		await client.matrixClient.sendMessage(data.roomId, content)
	}
</script>

<svelte:head>
	<title>{data.room?.name ? `${data.room.name} | Violet` : 'Violet'}</title>
</svelte:head>

{#if !data.roomId || data.roomIsSpace}
	<div class="center">
		<h1>pick a conversation</h1>
	</div>
{:else}
	<div class="timeline-wrapper" class:has-form-status={$editingOrReplying}>
		{#key data.room}
			<Timeline room={data.room}></Timeline>
		{/key}
		{#if $editingOrReplying}
			<div class="form-status-wrapper">
				<div class="form-status">
					<span class="text"
						>{#if $editingOrReplying == 'editing'}
							Editing message...
						{:else if $editingOrReplying == 'replying'}
							Replying to message...
						{/if}</span
					>
					<button
						on:click={() => {
							$selection = null
							$editingOrReplying = null
						}}
					>
						<span class="sr-only">Cancel</span>
						<CloseIcon width="12" height="12" aria-hidden="true"></CloseIcon>
					</button>
				</div>
			</div>
		{/if}
	</div>
	<div class="form" class:has-buttons={!$finePointer}>
		<Textarea
			bind:value={message}
			on:keydown={e => {
				if ($finePointer) {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault()
						sendMessage()
					}
				}
			}}
			placeholder="Send a message..."
		/>
		{#if !$finePointer}
			<button on:click={sendMessage}>
				<span class="sr-only">Send</span>
				<SendIcon aria-hidden="true"></SendIcon>
			</button>
		{/if}
	</div>
{/if}

<style lang="postcss">
	.timeline-wrapper {
		position: relative;
		min-height: 0;
		transition: padding-bottom 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}
	.timeline-wrapper.has-form-status {
		padding-bottom: 1rem;
	}
	.form-status-wrapper {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		font-size: 0.75rem;
		margin-inline: auto;
		width: 100%;
		max-width: 60rem;
		padding-inline: 0.5rem;
	}
	.form-status {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		border-radius: 0.25rem;
		width: fit-content;
		padding: 0.25rem;
		background-color: var(--slate-950);
	}
	.form-status button {
		width: 1.5rem;
		height: 1.5rem;
		margin: -0.5rem;
		display: grid;
		place-content: center;
	}
	.center {
		height: 100%;
		display: grid;
		place-content: center;
	}
	.form {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.25rem;
		z-index: 99;
		width: 100%;
		max-width: 60rem;
		margin: 0 auto;
		padding: 0.5rem;
		padding-bottom: calc(env(safe-area-inset-bottom, 0rem) + 0.5rem);
	}
	.form.has-buttons {
		grid-template-columns: 1fr auto;
	}
	.form button {
		background-color: var(--slate-900);
		display: grid;
		place-content: center;
		width: 2.5rem;
		height: 2rem;
		border-radius: 0.25rem;
	}
	.form :global(.textarea .content) {
		font: inherit;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 0.5rem;
		background-color: var(--slate-950);
		width: 100%;
		min-height: 1rem;
		resize: none;
	}
	.form :global(textarea::placeholder) {
		color: var(--slate-700);
	}
	.form :global(textarea:focus) {
		outline: none;
	}
</style>
