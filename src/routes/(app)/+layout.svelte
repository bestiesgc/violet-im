<script lang="ts">
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import client from '$lib/client/index'
	import { Crypto, CryptoEvent, type Room } from 'matrix-js-sdk'
	import Sidebar from './Sidebar.svelte'
	import Verifier from './Verifier.svelte'
	import SettingsDialog from '$lib/Dialogs/Settings.svelte'
	import AtIcon from '$lib/Icons/at.svg?c'
	import HashIcon from '$lib/Icons/hash.svg?c'
	import HamburgerIcon from '$lib/Icons/hamburger.svg?c'
	import CloseIcon from '$lib/Icons/close.svg?c'
	import DeleteIcon from '$lib/Icons/delete.svg?c'
	import EditIcon from '$lib/Icons/edit.svg?c'
	import ReplyIcon from '$lib/Icons/reply.svg?c'
	import CopyIcon from '$lib/Icons/copy.svg?c'
	import { page } from '$app/stores'
	import { beforeNavigate, afterNavigate } from '$app/navigation'
	import { fly } from 'svelte/transition'
	import { expoOut } from 'svelte/easing'
	import Ticker from '$lib/Ticker.svelte'
	import type { WrappedEvent } from '$lib/client/event'
	import { finePointer, visualViewport } from '$lib/stores'
	import convertRemToPixels from '$lib/utils/rem'

	const selection = writable(<WrappedEvent[] | null>null)
	const editingOrReplying = writable(<'editing' | 'replying' | null>null)
	const showSettings = writable(false)
	setContext('selection', selection)
	setContext('editingOrReplying', editingOrReplying)
	setContext('showSettings', showSettings)

	const onWindowScroll = () => {
		let correctedPosition: number = 0
		if ($visualViewport?.offsetTop != null) {
			correctedPosition = $visualViewport?.offsetTop
		} else {
			const { top } = headerElement.getBoundingClientRect()
			correctedPosition = Math.abs(top)
		}
		headerElement.animate(
			{ paddingTop: `${correctedPosition + convertRemToPixels(0.5)}px` },
			{
				duration: 0,
				fill: 'forwards'
			}
		)
	}

	let headerElement: HTMLElement
	let rooms: Room[] = []
	let spaces: Room[] = []
	let mobileSidebarOpen = !$page.data.roomId || $page.data.roomIsSpace

	beforeNavigate(() => {
		$selection = null
		$editingOrReplying = null
	})

	afterNavigate(() => {
		mobileSidebarOpen = !($page.data.roomId && !$page.data.roomIsSpace)
	})

	async function load(_: string) {
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

	let verificationRequest: Crypto.VerificationRequest

	async function onVerificationRequest(request: Crypto.VerificationRequest) {
		verificationRequest = request
	}

	onMount(() => {
		client.matrixClient.on(
			CryptoEvent.VerificationRequest,
			onVerificationRequest
		)
		if (window.visualViewport) {
			window.visualViewport.addEventListener('scroll', onWindowScroll)
		} else {
			window.addEventListener('scroll', onWindowScroll)
		}
		return () => {
			client.matrixClient.off(
				CryptoEvent.VerificationRequest,
				onVerificationRequest
			)
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('scroll', onWindowScroll)
			} else {
				window.removeEventListener('scroll', onWindowScroll)
			}
		}
	})

	$: {
		load($page.data.roomId)
	}
</script>

<div class="layout">
	{#if verificationRequest}
		<Verifier bind:request={verificationRequest}></Verifier>
	{/if}

	<div class="sidebar-wrapper" class:mobile-visible={mobileSidebarOpen}>
		<Sidebar {spaces} {rooms}></Sidebar>
	</div>
	<main class="panel">
		<div class="room-view">
			<div class="header" bind:this={headerElement}>
				{#if $finePointer || $editingOrReplying || !$selection}
					<div
						class="group"
						in:fly={{ easing: expoOut, duration: 200, y: -20 }}
					>
						<button
							class="menu-button"
							on:click={() => (mobileSidebarOpen = !mobileSidebarOpen)}
						>
							<span class="sr-only">Expand menu</span>
							<HamburgerIcon aria-hidden="true"></HamburgerIcon>
						</button>
						{#if $page.data.isDirectMessage}
							<AtIcon class="room-icon" aria-hidden="true"></AtIcon>
						{:else if $page.data.roomId && !$page.data.roomIsSpace}
							<HashIcon class="room-icon" aria-hidden="true"></HashIcon>
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
						<button
							on:click={() => {
								$selection = null
								$editingOrReplying = null
							}}
						>
							<span class="sr-only">Deselect messages</span>
							<CloseIcon aria-hidden="true"></CloseIcon>
						</button>
						<span class="room-name">
							<Ticker number={$selection.length}></Ticker> selected
						</span>
					</div>
					<div
						class="group"
						in:fly={{ easing: expoOut, duration: 200, y: -20 }}
					>
						{#if $selection?.length === 1}
							{#if $selection[0].sender?.userId === client.getUserId()}
								<button
									on:click={() => {
										$editingOrReplying = 'editing'
									}}
								>
									<span class="sr-only">Edit</span>
									<EditIcon aria-hidden="true"></EditIcon>
								</button>
							{/if}
							<button
								on:click={() => {
									$editingOrReplying = 'replying'
								}}
							>
								<span class="sr-only">Reply</span>
								<ReplyIcon aria-hidden="true"></ReplyIcon>
							</button>
						{/if}
						<button
							on:click={() => {
								if (!$selection) return
								const text = $selection
									.map(event => {
										const { sender, content } = event
										if (!content?.body) return ''
										const name = sender?.name || 'Unknown'
										return `${name}: ${content.body}\n`
									})
									.join('')
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
								if (!$selection) return
								await Promise.all(
									$selection.map(event => client.deleteEvent(event))
								)
								$selection = null
								$editingOrReplying = null
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

{#if $showSettings}
	<SettingsDialog></SettingsDialog>
{/if}

<style lang="postcss">
	.layout :global(.verifier) {
		z-index: 99999999999;
		background-color: var(--slate-950);
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
	}
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
		z-index: 99;
		border-radius: 0.25rem 0.25rem 0 0;
		background-color: var(--slate-900);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		justify-content: space-between;
		font-weight: 700;
		padding: 0.5rem;
		font-size: 1.25rem;
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
		place-content: center;
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
			z-index: 100;
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
		.room-view .header {
			position: sticky;
			top: 0;
			left: 0;
			right: 0;
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
