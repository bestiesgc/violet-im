<script lang="ts">
	import client from '$lib/client'

	import Wrapper from './Wrapper.svelte'
	import Form from '$lib/Form/Form.svelte'
	import TextInput from '$lib/Form/TextInput.svelte'
	import Button from '$lib/Form/Button.svelte'

	export let closeDialog: (() => void) | null = null
	let securityKey: string

	async function submit() {
		const backup = await client.matrixClient.checkKeyBackup()
		if (!backup?.backupInfo) throw new Error('No backup found')
		let securityKeyTrimmed = securityKey.replace(/\s/g, '')
		const restoreResult =
			await client.matrixClient.restoreKeyBackupWithRecoveryKey(
				securityKeyTrimmed,
				undefined,
				undefined,
				backup.backupInfo
			)
		closeDialog?.()
		if (restoreResult?.total) {
			console.log('Successfully restored backup')
		} else {
			throw new Error('Failed to restore backup')
		}
	}
</script>

<Wrapper {closeDialog}>
	<span slot="title">Secure Backup</span>
	<p>Input a Security Key.</p>
	<Form on:submit={submit}>
		<TextInput type="text" label="Security Key" bind:value={securityKey} />
		<Button type="submit">Submit</Button>
	</Form>
</Wrapper>
