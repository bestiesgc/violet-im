<script lang="ts">
	import type { Room } from 'matrix-js-sdk'
	import { getContext } from 'svelte'
	import { page } from '$app/stores'
	import RoomAvatar from '$lib/Room/Avatar.svelte'
	import RoomList from '$lib/Room/RoomList.svelte'
	import SettingsIcon from '$lib/Icons/settings.svg?c'
	import type { Writable } from 'svelte/store'
	export let spaces: Room[]
	export let rooms: Room[]

	const showSettings: Writable<boolean> = getContext('showSettings')
</script>

<div class="panel spaces">
	<a href="/" class="space" title="direct messages">
		<span class="sr-only">direct messages</span>
		<div class="avatar icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="currentColor"
				viewBox="0 -960 960 960"
				><path
					d="M479.761-74.022q-84.082 0-158.095-31.858-74.014-31.859-128.97-86.816-54.957-54.956-86.816-129.019-31.858-74.063-31.858-158.272 0-84.209 31.858-158.285 31.859-74.076 86.778-129.045 54.919-54.969 129-86.935 74.08-31.966 158.309-31.966T638.3-854.27q74.104 31.947 129.056 86.884 54.951 54.938 86.906 128.961 31.956 74.023 31.956 158.186v52.881q0 57.469-40.841 96.729-40.841 39.259-99.703 39.259-36.859 0-69.267-17.739Q644-326.848 627-359.326q-25.522 34.717-64.667 51.337-39.145 16.619-82.26 16.619-78.874 0-134.289-54.709-55.414-54.709-55.414-134.047 0-79.337 55.357-134.921 55.357-55.583 134.216-55.583 78.858 0 134.273 55.587Q669.63-559.455 669.63-480v51.31q0 30.219 22.397 51.139 22.396 20.921 53.381 20.921 30.88 0 52.975-20.921 22.095-20.92 22.095-51.139v-51.549q0-142.275-99.101-241.257Q622.275-820.478 480-820.478t-241.377 99.101Q139.522-622.275 139.522-480t98.982 241.377q98.982 99.101 241.353 99.101H694v65.5H479.761Zm.34-282.608q51.703 0 87.986-36.075t36.283-87.337q0-52.762-36.384-89.045t-88.087-36.283q-51.703 0-87.986 36.325t-36.283 89.087q0 51.262 36.384 87.295t88.087 36.033Z"
				/></svg
			>
		</div>
	</a>
	<hr />
	{#each spaces as space}
		<a href="/room/{space.roomId}" class="space" title={space.name}>
			<RoomAvatar size={40} room={space}></RoomAvatar>
		</a>
	{/each}
	<div style:flex-grow="1"></div>
	<button on:click={() => ($showSettings = true)} class="space">
		<span class="sr-only">Settings</span>
		<div class="avatar icon">
			<span class="sr-only">Settings</span>
			<SettingsIcon aria-hidden="true"></SettingsIcon>
		</div>
	</button>
</div>
<div class="panel rooms" class:has-header={$page.data.space}>
	{#if $page.data.space}
		<div class="rooms-header">
			{$page.data.space.name}
		</div>
	{:else}
		<div class="rooms-header">Home</div>
	{/if}
	<div class="scroller">
		<RoomList {rooms}></RoomList>
	</div>
</div>

<style lang="postcss">
	.spaces {
		display: flex;
		gap: 0.25rem;
		padding: 0.5rem;
		flex-direction: column;
	}
	.spaces hr {
		margin-block: 0;
		margin-inline: 1rem;
		border: none;
		color: transparent;
		border-bottom: 1px solid var(--slate-700);
	}
	.space {
		padding: 0.5rem;
		border-radius: 0.25rem;
	}
	.space .avatar.icon {
		background-color: var(--slate-700);
		color: var(--slate-100);
		display: grid;
		place-content: center;
	}
	.space:hover {
		background-color: var(--slate-800);
	}
	.space :global(.avatar) {
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 0.25rem;
	}
	.rooms-header {
		font-weight: 700;
		padding: 0.75rem 0.5rem;
		font-size: 1.25rem;
		border-bottom: 1px solid var(--slate-700);
	}
	.rooms {
		padding: 0.5rem 0;
		padding-top: 0;
		display: grid;
		grid-template-rows: auto 1fr;
	}
	.rooms :global(.section:first-child .toggle-list) {
		padding-top: 0.75rem;
	}
</style>
