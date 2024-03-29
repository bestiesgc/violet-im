<script lang="ts">
	import type { Room } from 'matrix-js-sdk'
	import client from '$lib/client/index'
	import RoomAvatar from '$lib/Room/Avatar.svelte'
	export let rooms: Room[]

	const dmRoomIds = client.getDmRoomIds()

	$: directMessages = rooms.filter(room => dmRoomIds.includes(room.roomId))
	$: notDirectMessages = rooms.filter(room => !dmRoomIds.includes(room.roomId))

	export let showDirectMessages = true
	export let showRooms = true

	let directsNavigatable = showDirectMessages
	let roomsNavigatable = showRooms
</script>

{#if directMessages.length > 0}
	<div
		class="section"
		class:expanded={showDirectMessages}
		on:transitionstart={() => {
			if (showDirectMessages) {
				directsNavigatable = true
			}
		}}
		on:transitionend={() => {
			directsNavigatable = showDirectMessages
		}}
	>
		<button
			aria-controls="dm-list"
			aria-expanded={showDirectMessages}
			class="toggle-list"
			on:click={() => (showDirectMessages = !showDirectMessages)}
		>
			<span>direct messages</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="16"
				width="16"
				viewBox="0 -960 960 960"
				aria-hidden="true"
				fill="currentColor"
				><path d="M480-345 240-585l43-43 197 198 197-197 43 43-240 239Z" /></svg
			>
		</button>
		<div class="rooms" style:display={!directsNavigatable ? 'none' : undefined}>
			{#each directMessages as room (room.roomId)}
				<a href="/room/{room.roomId}" class="room" title={room.name}>
					<RoomAvatar size={32} {room}></RoomAvatar>
					<span class="name">{room.name}</span>
				</a>
			{/each}
		</div>
	</div>
{/if}
{#if notDirectMessages.length > 0}
	<div
		class="section"
		class:expanded={showRooms}
		on:transitionstart={() => {
			if (showRooms) {
				roomsNavigatable = true
			}
		}}
		on:transitionend={() => {
			roomsNavigatable = showRooms
		}}
	>
		<button
			aria-controls="room-list"
			aria-expanded={showRooms}
			class="toggle-list"
			on:click={() => (showRooms = !showRooms)}
		>
			<span>rooms</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="16"
				width="16"
				viewBox="0 -960 960 960"
				aria-hidden="true"
				fill="currentColor"
				><path d="M480-345 240-585l43-43 197 198 197-197 43 43-240 239Z" /></svg
			>
		</button>
		<div
			class="rooms"
			id="room-list"
			style:display={!roomsNavigatable ? 'none' : undefined}
		>
			{#each notDirectMessages as room}
				<a href="/room/{room.roomId}" class="room" title={room.name}>
					<RoomAvatar size={32} {room}></RoomAvatar>
					<span class="name">{room.name}</span>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style lang="postcss">
	.section {
		display: grid;
		grid-template-rows: min-content 0fr;
		transition: grid-template-rows 200ms;
	}
	.section.expanded {
		grid-template-rows: min-content 1fr;
	}
	.section .rooms {
		overflow: hidden;
	}
	.section:not(.expanded) .rooms {
		padding-block: 0 !important;
	}
	.toggle-list {
		position: sticky;
		top: 0;
		background-color: var(--slate-900);
		padding: 0.25rem 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 600;
	}
	.toggle-list > svg {
		transition: transform 200ms;
	}
	.toggle-list[aria-expanded='true'] > svg {
		transform: scaleY(-1);
	}
	.rooms {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		flex-direction: column;
		transition: padding-block 200ms;
	}
	.room {
		color: inherit;
		text-decoration: none;
		display: grid;
		grid-template-columns: 2rem 1fr;
		align-items: center;
		padding: 0.25rem;
		border-radius: 0.25rem;
		gap: 0.5rem;
	}
	.room .name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.room:hover {
		background-color: var(--slate-800);
	}
	.room :global(.avatar) {
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 0.25rem;
	}
</style>
