<script lang="ts">
	import MultiPage from './MultiPage.svelte'
	import Button from '$lib/Form/Button.svelte'
	import SecureBackup from './SecureBackup.svelte'
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'

	const hasDialog: Writable<boolean> = getContext('hasDialog')

	export let closeDialog: (() => void) | null = null
	let pages = ['Security']
	let page: string
	let secureBackupSetup = false
</script>

{#if !secureBackupSetup}
	<MultiPage
		on:introend={() => ($hasDialog = true)}
		on:outrostart={() => {
			if (secureBackupSetup) return
			$hasDialog = false
		}}
		updateStore={false}
		{closeDialog}
		{pages}
		bind:page
	>
		<span slot="title">Settings</span>
		{#if page == 'Security'}
			<h3>Secure Backup</h3>
			<p>Restore from Security Key</p>
			<Button on:click={() => (secureBackupSetup = true)}>Restore</Button>
		{/if}
	</MultiPage>
{:else}
	<SecureBackup
		updateStore={false}
		closeDialog={() => (secureBackupSetup = false)}
	></SecureBackup>
{/if}

<style lang="postcss">
	p {
		margin-bottom: 0.5em;
	}
</style>
