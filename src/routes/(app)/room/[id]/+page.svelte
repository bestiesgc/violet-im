<script lang="ts">
	import client from '$lib/client/index'
	import Timeline from '$lib/Room/Timeline.svelte'
	import Textarea from '$lib/GrowingTextarea.svelte'
	import * as marked from 'marked'
	import type { IContent } from 'matrix-js-sdk'
	import { escape } from '$lib/escape'
	export let data

	let message: string

	async function sendMessage() {
		if (!data.roomId) throw new Error('Not in room')
		const body = message.trim()
		message = ''
		let formattedBody = body.replace(
			/(\n|^)(>[^\s].*(?:\n>[^\s].*)*)/gm,
			(_, p1, p2) => {
				return `${p1}<font color="#e574ff">${escape(p2).replace(
					/\n/gm,
					'<br>'
				)}</font>`
			}
		)
		let markedResult = await marked.parseInline(formattedBody, {
			async: true
		})
		if (markedResult) {
			formattedBody = markedResult
		}
		const content: IContent = {
			msgtype: 'm.text',
			body
		}
		if (formattedBody != body) {
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
	{#key data.room}
		<Timeline room={data.room}></Timeline>
	{/key}
	<div class="form">
		<Textarea
			bind:value={message}
			on:keydown={e => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault()
					sendMessage()
				}
			}}
			placeholder="Send a message..."
		/>
	</div>
{/if}

<style lang="postcss">
	.center {
		height: 100%;
		display: grid;
		place-items: center;
	}
	.form {
		width: 100%;
		max-width: 60rem;
		margin: 0 auto;
		padding: 0.5rem;
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
