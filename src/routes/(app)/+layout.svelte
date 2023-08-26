<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import client from '$lib/client/index.js'
	import Sidebar from '$lib/Sidebar.svelte'
	import AtIcon from '$lib/Icons/at.svg'
	import HashIcon from '$lib/Icons/hash.svg'
	import HamburgerIcon from '$lib/Icons/hamburger.svg'
	import CloseIcon from '$lib/Icons/close.svg'
	import DeleteIcon from '$lib/Icons/delete.svg'
	import EditIcon from '$lib/Icons/edit.svg'
	import ReplyIcon from '$lib/Icons/reply.svg'
	import CopyIcon from '$lib/Icons/copy.svg'
	import { page } from '$app/stores'
	import { afterNavigate } from '$app/navigation'
	import { fly } from 'svelte/transition'
	import { expoOut } from 'svelte/easing'
	import Ticker from '$lib/Ticker.svelte'

	const selection = writable()
	setContext('selection', selection)

	let rooms = []
	let spaces = []
	let mobileSidebarOpen = !$page.data.roomId || $page.data.roomIsSpace

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
				{#if !$selection}
					<div
						class="group"
						in:fly={{ easing: expoOut, duration: 200, y: -20 }}
					>
						<button
							class="menu-button"
							on:click={() => (mobileSidebarOpen = !mobileSidebarOpen)}
						>
							<HamburgerIcon></HamburgerIcon>
						</button>
						{#if $page.data.isDirectMessage}
							<AtIcon class="room-icon"></AtIcon>
						{:else if $page.data.roomId && !$page.data.roomIsSpace}
							<HashIcon class="room-icon"></HashIcon>
						{/if}
						<span class="room-name"
							>{$page.data.room?.name && !$page.data.roomIsSpace
								? $page.data.room.name
								: 'Violet'}</span
						>
					</div>
				{:else}
					<div
						class="group"
						in:fly={{ easing: expoOut, duration: 200, y: -20 }}
					>
						<button on:click={() => ($selection = null)}>
							<CloseIcon></CloseIcon>
						</button>
						<span class="room-name">
							<Ticker number={$selection.length}></Ticker> selected
						</span>
					</div>
					<div
						class="group"
						in:fly={{ easing: expoOut, duration: 200, y: -20 }}
					>
						<!-- TODO: implement! -->
						{#if false && $selection.length === 1}
							<button>
								<span class="sr-only">Reply</span>
								<ReplyIcon aria-hidden="true"></ReplyIcon>
							</button>
							<button>
								<span class="sr-only">Edit</span>
								<EditIcon aria-hidden="true"></EditIcon>
							</button>
						{/if}
						<button
							on:click={() => {
								const text = $selection
									.map(event => {
										const { sender } = event
										const content = event.getContent().body
										const name = sender?.name || sender?.username || 'Unknown'
										return `${name}: ${content}`
									})
									.join('\n')
								const type = 'text/plain'
								const blob = new Blob([text], { type })
								const data = [new ClipboardItem({ [type]: blob })]
								navigator.clipboard.write(data)
							}}
						>
							<span class="sr-only">Copy</span>
							<CopyIcon aria-hidden="true"></CopyIcon>
						</button>
						<button
							on:click={async () => {
								await Promise.all(
									$selection.map(event => client.deleteEvent(event))
								)
								$selection = null
							}}
						>
							<span class="sr-only">Delete</span>
							<DeleteIcon aria-hidden="true"></DeleteIcon>
						</button>
					</div>
				{/if}
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
	.room-view {
		height: 100%;
		display: grid;
		grid-template-rows: min-content 1fr auto;
	}
	.room-view .header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		justify-content: space-between;
		font-weight: 700;
		padding: 0.5rem;
		font-size: 1.25rem;
		height: 51px;
		border-bottom: 1px solid var(--slate-700);
	}
	.room-view .header .group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.room-view .header :global(.room-icon) {
		color: var(--slate-500);
	}
	.room-view .header .room-name {
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.room-view .header button {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
	}
	.room-view .header .menu-button {
		display: none;
	}
	.room-view .header .group:first-child button:first-child {
		margin-right: 0.5rem;
	}
	@media screen and (max-width: 600px) {
		.layout {
			grid-template-columns: 1fr;
			padding: 0;
		}
		.sidebar-wrapper {
			z-index: 10;
			background-color: var(--slate-950);
			border-radius: 0.25rem;
			width: 100%;
			grid-template-columns: 4.5rem 1fr;
			box-shadow: 0 0 1rem rgba(0, 0, 0, 0.25);
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			transform: translateX(-100%);
			visibility: hidden;
			transition:
				transform 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
				visibility 400ms 0ms;
		}
		.sidebar-wrapper.mobile-visible {
			transform: translateX(0%);
			visibility: visible;
		}
		.room-view .header .menu-button {
			display: grid;
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
</style>
