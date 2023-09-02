<script lang="ts">
	import Wrapper from './Wrapper.svelte'
	export let updateStore = true
	export let pages: string[]
	export let page: string = pages[0]
	export let closeDialog: (() => void) | null
</script>

<Wrapper on:introend on:outrostart {updateStore} {closeDialog}>
	<svelte:fragment slot="title"><slot name="title" /></svelte:fragment>
	<div class="layout" slot="content">
		<div class="pages">
			{#each pages as pageName}
				<button on:click={() => (page = pageName)}>{pageName}</button>
			{/each}
		</div>
		<div class="content">
			<slot />
		</div>
	</div>
</Wrapper>

<style lang="postcss">
	.layout {
		/* margin: -0.75rem -0.5rem; */
		display: grid;
		grid-template-columns: 8rem 1fr;
		height: 100%;
	}
	.pages {
		padding: 0.75rem 0.25rem;
		background-color: var(--slate-950);
		display: grid;
	}
	.pages button {
		background-color: var(--slate-900);
		border-radius: 0.25rem;
		font-weight: 500;
		display: flex;
		padding: 0.25rem;
		align-items: center;
		height: 1.5rem;
	}
	.content {
		padding: 0.75rem 0.5rem;
		min-width: 12rem;
		min-height: 8rem;
	}
	.content :global(:first-child) {
		margin-top: 0;
	}
</style>
