<script lang="ts">
	import type { Writable } from 'svelte/store'
	import MultiPage from './MultiPage.svelte'
	import Button from '$lib/Form/Button.svelte'
	import SecureBackup from './SecureBackup.svelte'
	import { getContext } from 'svelte'
	const showSettings: Writable<boolean> = getContext('showSettings')
	let pages = ['Security']
	let page: string
	let secureBackupSetup = false
</script>

{#if !secureBackupSetup}
	<MultiPage closeDialog={() => ($showSettings = false)} {pages} bind:page>
		{#if page == 'Security'}
			<h3>Secure Backup</h3>
			<p>Restore from Security Key</p>
			<Button on:click={() => (secureBackupSetup = true)}>Restore</Button>
		{/if}
	</MultiPage>
{:else}
	<SecureBackup></SecureBackup>
{/if}
