<script>
	export let event
	export let lastEvent
	export let nextEvent

	let eventStuff = event.clearEvent ?? event.event
	async function loadEventStuff() {
		await event.getDecryptionPromise()
		eventStuff = event.clearEvent
	}
	if (!event.clearEvent) {
		loadEventStuff()
	}
</script>

<div class="event">
	{#if event.event?.type == 'm.room.encrypted'}
		{#if event.clearEvent && eventStuff?.type == 'm.room.message'}
			<div
				class="message"
				class:from-me={event.sender.userId == window.matrixClient.getUserId()}
				class:sequential-message={lastEvent?.sender.userId ==
					event.sender.userId}
				class:ends-group={nextEvent?.sender.userId != event.sender.userId}
			>
				<img
					aria-hidden="true"
					src={event.sender.getAvatarUrl(window.matrixClient.baseUrl, 32, 32)}
					alt=""
					class="avatar"
				/>
				<div class="content">
					<div class="sender">
						<p class="name">{event.sender.name}</p>
					</div>
					<div class="body">
						{@html eventStuff.content.formatted_body ?? eventStuff.content.body}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.message {
		margin: 1px 0;
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
	.message:not(.sequential-message) {
		margin-top: 1rem;
	}
	.message.sequential-message .avatar {
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
	.message.sequential-message .sender {
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
	.message.sequential-message .body {
		border-top-left-radius: 0;
	}
	.message:not(.ends-group) .body {
		border-bottom-left-radius: 0;
	}
	.message.from-me.sequential-message .body {
		border-top-right-radius: 0;
		border-top-left-radius: 0.5rem;
	}
	.message.from-me:not(.ends-group) .body {
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0.5rem;
	}
</style>
