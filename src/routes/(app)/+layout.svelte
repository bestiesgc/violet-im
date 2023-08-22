<script>
	import client from '$lib/client/index.js'
	import Sidebar from '$lib/Sidebar.svelte'
	import { page } from '$app/stores'

	let rooms = []
	let spaces = []

	async function load() {
		const allRooms = await client.getAllRooms()
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
	<main class="panel">
		<slot />
	</main>
</div>

<style lang="postcss">
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
</style>
