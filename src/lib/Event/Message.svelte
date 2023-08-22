<script>
	import DOMPurify from 'dompurify'
	import { getMemberAvatarUrl, getUserId } from '$lib/client/index.js'
	export let event
	export let sender
	export let startsGroup = false
	export let endsGroup = false
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
		<div class="body">
			{@html DOMPurify.sanitize(
				event.content?.formatted_body ?? event.content?.body
			)}
		</div>
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
		width: fit-content;
		max-width: min(100%, 40rem);
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--slate-800);
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
