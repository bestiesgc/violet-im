<script>
	import DOMPurify from 'dompurify'
	import { getMemberAvatarUrl, getUserId } from '$lib/client/index.js'
	export let event
	export let sender
	export let lastEvent = null
	export let nextEvent = null
	let startsGroup = lastEvent?.sender.userId != sender.userId
	let endsGroup = event.reactions ?? nextEvent?.sender.userId != sender.userId
</script>

<div
	class="message"
	class:from-me={sender.userId == getUserId()}
	class:starts-group={startsGroup}
	class:ends-group={endsGroup}
>
	<img
		aria-hidden="true"
		src={getMemberAvatarUrl(sender, 32)}
		alt=""
		class="avatar"
	/>
	<div class="content">
		<div class="sender">
			<p class="name">{sender.name}</p>
		</div>
		<div
			class="body"
			style:border-top-left-radius={lastEvent?.reactions ? '0.5rem' : undefined}
		>
			{@html DOMPurify.sanitize(
				event.content?.formatted_body ?? event.content?.body
			)}
		</div>
		{#if event.reactions}
			<div class="reactions">
				{#each Object.keys(event.reactions) as reaction}
					<span class="reaction">
						{reaction}
						<span aria-hidden="true" class="reactors">
							{#each event.reactions[reaction] as reactor}
								<img src={getMemberAvatarUrl(reactor, 16)} alt="" />
							{/each}
						</span>
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.message {
		padding: 1px 0;
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.5rem;
		margin-inline-end: 1rem;
	}
	.message.from-me {
		margin-inline-start: auto;
		margin-inline-end: 0;
		margin-inline-start: 1rem;
	}
	.message.from-me .body {
		margin-inline-start: auto;
		background-color: var(--slate-700);
	}
	.message.from-me .sender {
		display: none;
	}
	.message.from-me .avatar {
		visibility: hidden;
		width: 1px;
		height: 1px;
	}
	.message .avatar {
		user-select: none;
		width: 2rem;
		border-radius: 0.25rem;
	}
	.message.starts-group {
		margin-top: 1rem;
	}
	.message:not(.starts-group) .avatar {
		visibility: hidden;
		width: 1px;
		height: 1px;
	}
	.message .body {
		position: relative;
		width: fit-content;
		max-width: min(100%, 40rem);
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
	}
	.message .reactions {
		margin-top: 2px;
		display: flex;
		gap: 0.25rem;
	}
	.message .reaction {
		display: flex;
		gap: 0.25rem;
		border-radius: 0.75rem;
		padding: 0.125rem;
		background-color: var(--violet-600);
	}
	.message .reaction .reactors {
		display: flex;
		gap: 0.125rem;
	}
	.message .reaction .reactors img {
		width: 1.25rem;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 100%;
	}
	.message:not(.starts-group) .sender {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
	.message:not(.starts-group) .body {
		border-top-left-radius: 0;
	}
	.message:not(.ends-group) .body {
		border-bottom-left-radius: 0;
	}
	.message.from-me:not(.starts-group) .body {
		border-top-right-radius: 0;
		border-top-left-radius: 0.5rem;
	}
	.message.from-me:not(.ends-group) .body {
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0.5rem;
	}
</style>
