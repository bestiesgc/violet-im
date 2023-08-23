<script>
	import client from '$lib/client/index.js'
	import Timeline from '$lib/Room/Timeline.svelte'
	import Textarea from '$lib/GrowingTextarea.svelte'
	import * as marked from 'marked'
	export let data
	async function sendMessage() {
		const body = message.trim()
		message = ''
		const formattedBody = await marked.parse(body, {
			async: true
		})
		const content = {
			msgtype: 'm.text',
			body
		}
		if (formattedBody != body) {
			content.format = 'org.matrix.custom.html'
			content.formatted_body = formattedBody
		}
		await client.matrixClient.sendMessage(data.roomId, content)
	}
	let message
</script>

{#if !data.roomId || data.roomIsSpace}
	<div class="center">
		<h1>pick a conversation</h1>
	</div>
{:else}
	<div class="room-view">
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
	</div>
{/if}

<style lang="postcss">
	.center {
		height: 100%;
		display: grid;
		place-items: center;
	}
	.room-view {
		height: 100%;
		display: grid;
		grid-template-rows: 1fr auto;
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
