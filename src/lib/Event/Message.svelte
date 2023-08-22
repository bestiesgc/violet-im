<script>
	import Body from './Body.svelte'
	import client from '$lib/client/index.js'
	export let event
	export let sender
	export let lastEvent = null
	export let nextEvent = null
	$: startsGroup = lastEvent?.sender.userId != sender.userId
	$: endsGroup = event.reactions ?? nextEvent?.sender.userId != sender.userId
</script>

<div
	class="message"
	class:from-me={sender.userId == client.getUserId()}
	class:starts-group={startsGroup}
	class:ends-group={endsGroup}
>
	<img
		aria-hidden="true"
		src={client.getMemberAvatarUrl(sender, 32)}
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
			<Body body={event.content?.formatted_body ?? event.content?.body}></Body>
		</div>
		{#if event.reactions}
			<div class="reactions">
				{#each Object.keys(event.reactions) as reaction}
					<span class="reaction">
						{#if reaction.startsWith('mxc://')}
							<img
								class="reaction-emoji"
								title={event.reactions[reaction].shortcode}
								src={client.matrixClient.mxcUrlToHttp(reaction)}
								alt={event.reactions[reaction].shortcode}
							/>
						{:else}
							{reaction}
						{/if}
						<span aria-hidden="true" class="reactors">
							{#each event.reactions[reaction].senders as reactor}
								<img src={client.getMemberAvatarUrl(reactor, 16)} alt="" />
							{/each}
						</span>
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.message {
		padding: 1px 0;
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.5rem;
		margin-inline-end: 1rem;
	}
	.avatar {
		user-select: none;
		width: 2rem;
		border-radius: 0.25rem;
	}
	.body {
		position: relative;
		width: fit-content;
		max-width: min(100%, 40rem);
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
	}
	.reactions {
		margin-top: 2px;
		display: flex;
		gap: 0.25rem;
	}
	.reaction {
		display: flex;
		gap: 0.25rem;
		border-radius: 0.75rem;
		padding: 0.125rem;
		background-color: var(--violet-600);
	}
	.reaction .reactors {
		display: flex;
		gap: 0.125rem;
	}
	.reaction .reaction-emoji {
		width: 1.25rem;
		aspect-ratio: 1;
		object-fit: cover;
	}
	.reaction .reactors img {
		width: 1.25rem;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 100%;
	}
	.starts-group {
		margin-top: 1rem;
	}
	.message:not(.starts-group) .avatar {
		visibility: hidden;
		width: 0px;
		height: 0px;
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
	.from-me .body {
		background-color: var(--slate-700);
	}
	@media screen and (min-width: 800px) {
		.from-me {
			margin-inline-start: auto;
			margin-inline-end: 0;
			margin-inline-start: 1rem;
			.body {
				margin-inline-start: auto;
			}
			.sender,
			.avatar {
				opacity: 0;
				width: 0px;
				height: 0px;
				padding: 0;
				margin: -1px;
				white-space: nowrap;
				border-width: 0;
			}
		}
		.from-me:not(.starts-group) .body {
			border-top-right-radius: 0;
			border-top-left-radius: 0.5rem;
		}
		.from-me:not(.ends-group) .body {
			border-bottom-right-radius: 0;
			border-bottom-left-radius: 0.5rem;
		}
	}
</style>
