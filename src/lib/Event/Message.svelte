<script>
	import Bubble from './Bubble.svelte'
	import Body from './Body.svelte'
	import Attachment from './Attachment.svelte'
	import client from '$lib/client/index.js'
	export let event
	export let sender
	export let lastEvent = null
	export let nextEvent = null
	$: startsGroup = lastEvent?.sender.userId != sender.userId
	$: endsGroup =
		event.reactions ??
		nextEvent?.replyEvent ??
		nextEvent?.sender.userId != sender.userId

	let allEmoji = false
	$: {
		console.log('!', allEmoji)
	}

	function highlightReply() {
		const timelineScroller = document.querySelector('ol.timeline.scroller')
		const replyElement = document.getElementById(
			'message_' + event.replyEvent.getId()
		)
		const minimum = timelineScroller.scrollTop + 100
		const maximum =
			timelineScroller.scrollTop + timelineScroller.offsetHeight - 100
		const inView =
			replyElement.offsetTop > minimum && replyElement.offsetTop < maximum
		if (!inView) {
			timelineScroller.scrollTo({
				top: replyElement.offsetTop - 150,
				behavior: 'smooth'
			})
		}
		if (!replyElement.classList.contains('highlight')) {
			replyElement.classList.toggle('highlight', true)
			setTimeout(() => {
				replyElement.classList.toggle('highlight', false)
			}, 1000)
		}
	}
</script>

<div
	class="message-wrapper"
	class:from-me={sender.userId == client.getUserId()}
	class:starts-group={startsGroup}
	class:ends-group={endsGroup}
>
	{#if event.replyEvent}
		<button on:click={highlightReply} class="reply-line">
			<div class="fancy-arrow"></div>
			<span class="sender">{event.replyEvent.sender.name}</span>
			<span class="text"
				><Body
					body={event.replyEvent.getContent().formatted_body ??
						event.replyEvent.getContent().body}
				/></span
			>
		</button>
	{/if}
	<div class="message">
		<img
			aria-hidden="true"
			src={client.getMemberAvatarUrl(sender, 32)}
			alt=""
			class="avatar"
		/>
		<div class="content" class:all-emoji={allEmoji}>
			<div class="sender">
				<p class="name">{sender.name}</p>
			</div>
			{#if event.content.msgtype != 'm.image'}
				<Bubble
					joinLast={!(event.replyEvent ?? lastEvent?.reactions ?? startsGroup)}
					joinNext={!endsGroup}
					rightSide={sender.userId == client.getUserId()}
				>
					<Body
						bind:allEmoji
						body={event.content?.formatted_body ?? event.content?.body}
					/>
				</Bubble>
			{:else}
				<Bubble
					joinLast={!(event.replyEvent ?? lastEvent?.reactions ?? startsGroup)}
					joinNext={!endsGroup}
					rightSide={sender.userId == client.getUserId()}
					noPadding
				>
					<Attachment {event} />
				</Bubble>
			{/if}
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
</div>

<style lang="postcss">
	.reply-line {
		width: fit-content;
		display: flex;
		align-items: center;
		white-space: nowrap;
		gap: 0.25rem;
		margin: 0.25rem 0;
		margin-inline-start: 2.5rem;
		font-size: 0.875rem;
	}
	.reply-line .fancy-arrow {
		width: 0.5rem;
		height: 0.25rem;
		margin-top: 0.25rem;
		border-top-left-radius: 50%;
		border-top: 1px solid currentColor;
		border-left: 1px solid currentColor;
	}
	.reply-line .text {
		max-width: 10rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 0.25em;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
	}
	.reply-line .text :global(.body) {
		display: inline;
		text-overflow: ellipsis;
	}
	.message-wrapper {
		padding: 1px 0;
		margin-inline-end: 1rem;
	}
	.message {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.5rem;
	}
	.avatar {
		user-select: none;
		width: 2rem;
		border-radius: 0.25rem;
	}
	.all-emoji :global(.bubble) {
		padding: 0;
		background: none !important;
	}
	.all-emoji :global(.bubble .emoji:only-child) {
		width: 4em;
		height: 4em;
	}
	.reactions {
		margin-top: 2px;
		display: flex;
		gap: 0.25rem;
		width: fit-content;
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
	.message-wrapper:not(.starts-group) .avatar {
		visibility: hidden;
		width: 0px;
		height: 0px;
	}
	.message-wrapper:not(.starts-group) .message .sender {
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
	.from-me {
		margin-inline-start: auto;
		margin-inline-end: 0;
		margin-inline-start: 1rem;
		:global(.bubble) {
			background-color: var(--slate-700);
		}
		.reply-line {
			margin-inline-start: auto;
		}
		.reply-line .fancy-arrow {
			transform: scaleX(-1);
			order: 3;
		}
		.message .sender,
		.avatar {
			opacity: 0;
			width: 0px;
			height: 0px;
			padding: 0;
			margin: -1px;
			white-space: nowrap;
			border-width: 0;
		}
		.reactions {
			margin-inline-start: auto;
		}
	}
</style>
