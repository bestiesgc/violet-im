<script>
	import client from '$lib/client/index.js'
	import Sidebar from '$lib/Sidebar.svelte'
	import AtIcon from '$lib/Icons/at.svg'
	import HashIcon from '$lib/Icons/hash.svg'
	import HamburgerIcon from '$lib/Icons/hamburger.svg'
	import { page } from '$app/stores'
	import { afterNavigate } from '$app/navigation'

	let rooms = []
	let spaces = []
	let mobileSidebarOpen = false

	afterNavigate(() => {
		if ($page.data.roomId && !$page.data.roomIsSpace) {
			mobileSidebarOpen = false
		}
	})

	async function load() {
		if (!client.getAllRooms()) await client.loadAllRooms()
		const allRooms = client.getAllRooms()
		if ($page.data.spaceChildren) {
			rooms = allRooms.filter(room =>
				$page.data.spaceChildren.includes(room.roomId)
			)
		} else {
			rooms = allRooms.filter(room => !room.isSpaceRoom())
		}
		spaces = allRooms.filter(room => room.isSpaceRoom())
	}

	$: {
		load($page.data.roomId)
	}
</script>

<div class="layout">
	<div class="sidebar-wrapper" class:mobile-visible={mobileSidebarOpen}>
		<Sidebar {spaces} {rooms}></Sidebar>
	</div>
	<main class="panel">
		<div class="room-view">
			<div class="header">
				<button on:click={() => (mobileSidebarOpen = !mobileSidebarOpen)}>
					<HamburgerIcon></HamburgerIcon>
				</button>
				{#if $page.data.isDirectMessage}
					<AtIcon></AtIcon>
				{:else if $page.data.roomId && !$page.data.roomIsSpace}
					<HashIcon></HashIcon>
				{/if}
				<span class="room-name"
					>{$page.data.room?.name && !$page.data.roomIsSpace
						? $page.data.room.name
						: 'Violet'}</span
				>
			</div>
			<slot />
		</div>
	</main>
</div>

<style lang="postcss">
	.layout {
		height: 100%;
		display: grid;
		grid-template-columns: auto 1fr;
		padding: 0.25rem;
		gap: 0.25rem;
	}
	.sidebar-wrapper {
		display: grid;
		grid-template-columns: 4.5rem 14rem;
		gap: 0.25rem;
		min-height: 0;
	}
	@media screen and (max-width: 600px) {
		.layout {
			grid-template-columns: 1fr;
			padding: 0;
		}
		.sidebar-wrapper {
			background-color: var(--slate-950);
			border-radius: 0.25rem;
			width: 100%;
			grid-template-columns: 4.5rem 1fr;
			box-shadow: 0 0 1rem rgba(0, 0, 0, 0.25);
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			transition: transform 400ms;
		}
		.sidebar-wrapper:not(.mobile-visible) {
			transform: translateX(-100%);
		}
	}
	.layout :global(main) {
		background-color: var(--slate-900);
		border-radius: 0.25rem;
	}
	.layout :global(.panel) {
		background-color: var(--slate-900);
		border-radius: 0.25rem;
		scrollbar-width: thin;
		scrollbar-color: var(--slate-500) transparent;
		min-height: 0;
		overflow-y: auto;
	}
	.layout :global(.panel::-webkit-scrollbar) {
		width: 0.25rem;
	}
	.layout :global(.panel::-webkit-scrollbar-thumb) {
		border-radius: 0.25rem;
	}
	.room-view {
		height: 100%;
		display: grid;
		grid-template-rows: min-content 1fr auto;
	}
	.room-view .header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 700;
		padding: 0.75rem 0.5rem;
		font-size: 1.25rem;
		border-bottom: 1px solid var(--slate-700);
	}
	.room-view .header button {
		width: 1.5rem;
		height: 1.5rem;
	}
</style>
