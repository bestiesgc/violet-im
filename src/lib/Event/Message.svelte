<script lang="ts">
	import Bubble from './Bubble.svelte'
	import Body from './Body.svelte'
	import Avatar from '$lib/Member/Avatar.svelte'
	import Attachment from './Attachment.svelte'
	import client from '$lib/client/index'
	import type { WrappedEvent, WrappedMessageEvent } from '$lib/client/event'
	import { escape } from '$lib/utils/escape'
	import Twemojify from '$lib/Twemojify.svelte'

	export let event: WrappedMessageEvent
	export let lastEvent: WrappedEvent | null = null
	export let nextEvent: WrappedEvent | null = null
	export let preview = false
	$: startsGroup =
		!lastEvent || lastEvent?.sender?.userId != event?.sender?.userId
	$: endsGroup =
		!nextEvent ||
		Object.keys(event.reactions).length > 0 ||
		nextEvent?.replyEvent ||
		nextEvent?.sender?.userId != event?.sender?.userId

	let allEmoji = false

	function highlightReply() {
		if (!event.replyEvent) throw new Error('Reply event not found')
		const timelineScroller = <HTMLElement>(
			document.querySelector('ol.timeline.scroller')
		)
		if (!timelineScroller) throw new Error('Timeline scroller not found')
		const replyElement = <HTMLElement>(
			document.getElementById('message_' + event.replyEvent.id)
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
		if (!replyElement.parentElement?.classList.contains('highlight')) {
			replyElement.parentElement?.classList.toggle('highlight', true)
			setTimeout(() => {
				replyElement.parentElement?.classList.toggle('highlight', false)
			}, 1000)
		}
	}
</script>

<div
	class:not-preview={!preview}
	class="message-wrapper"
	class:from-me={!preview && event.sender?.userId == client.getUserId()}
	style:padding-top={!preview && startsGroup ? '0.5rem' : undefined}
	style:padding-bottom={!preview && endsGroup ? '0.5rem' : undefined}
	class:starts-group={startsGroup}
	class:ends-group={endsGroup}
>
	{#if event.replyEvent}
		<button on:click={highlightReply} class="reply-line">
			<div class="fancy-arrow"></div>
			<span class="sender">{event.replyEvent.sender?.name}</span>
			<span class="text"
				><Body
					body={event.replyEvent.content?.formatted_body ??
						event.replyEvent.content?.body}
				/></span
			>
		</button>
	{/if}
	<div class="message">
		{#if event.sender}
			<Avatar member={event.sender} size={32} />
		{/if}
		<div class="content" class:all-emoji={allEmoji}>
			<div class="sender">
				<p class="name">{event.sender.name}</p>
			</div>
			{#if event.content?.msgtype != 'm.image'}
				<Bubble
					tail={!allEmoji}
					joinLast={!(
						Object.keys(lastEvent?.reactions ?? {}).length > 0 ||
						startsGroup ||
						event.replyEvent
					)}
					joinNext={!endsGroup}
					rightSide={!preview && event.sender.userId == client.getUserId()}
				>
					{#if event.content?.formatted_body && event.content.format == 'org.matrix.custom.html'}<Body
							bind:allEmoji
							body={event.content?.formatted_body}
						/>{:else}<Body
							bind:allEmoji
							body={escape(event.content?.body)}
						/>{/if}</Bubble
				>
			{:else}
				<Bubble
					joinLast={!(
						Object.keys(lastEvent?.reactions ?? {}).length > 0 ||
						startsGroup ||
						event.replyEvent
					)}
					tail={false}
					joinNext={!endsGroup}
					rightSide={!preview && event.sender.userId == client.getUserId()}
					noPadding
				>
					<Attachment {event} />
				</Bubble>
			{/if}
			{#if Object.keys(event.reactions).length > 0}
				<div class="reactions">
					{#each Object.keys(event.reactions) as reaction}
						<span class="reaction">
							{#if reaction.startsWith('mxc://')}
								<img
									class="emoji"
									title={event.reactions[reaction].shortcode}
									alt={event.reactions[reaction].shortcode}
									src={client.matrixClient.mxcUrlToHttp(reaction)}
								/>
							{:else if /^https?:\/\//.test(reaction)}
								<img
									class="emoji"
									title={event.reactions[reaction].shortcode}
									alt={event.reactions[reaction].shortcode}
									src={reaction}
								/>
							{:else}
								<Twemojify text={reaction}></Twemojify>
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
	@media screen and (max-width: 600px) {
		.not-preview {
			user-select: none;
		}
	}
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
	.reply-line :global(.body) {
		white-space: nowrap;
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
	.message :global(.avatar) {
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
	.reaction :global(.emoji) {
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
	.message-wrapper:not(.starts-group) :global(.avatar) {
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
		.reply-line {
			margin-inline-start: auto;
		}
		.reply-line .fancy-arrow {
			transform: scaleX(-1);
			order: 3;
		}
		.message .sender,
		.message :global(.avatar) {
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
