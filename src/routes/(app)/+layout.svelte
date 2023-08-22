<script>
	import Sidebar from '$lib/Sidebar.svelte'
	import { page } from '$app/stores'

	let rooms = []
	let spaces = []

	async function load() {
		let allRooms = (await window.matrixClient.getJoinedRooms()).joined_rooms
			.map(roomId => window.matrixClient.getRoom(roomId))
			.filter(a => a)
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
	<Sidebar {spaces} {rooms}></Sidebar>
	<main>
		<slot />
	</main>
</div>

<style>
	.layout {
		height: 100%;
		display: grid;
		grid-template-columns: 4.5rem 14rem 1fr;
		padding: 0.25rem;
		gap: 0.25rem;
	}
	.layout :global(main) {
		background-color: var(--slate-900);
		border-radius: 0.25rem;
	}
</style>
