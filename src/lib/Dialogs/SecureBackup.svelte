<script lang="ts">
	import client from '$lib/client'
	import { createEventDispatcher } from 'svelte'

	import Wrapper from './Wrapper.svelte'
	import Form from '$lib/Form/Form.svelte'
	import TextInput from '$lib/Form/TextInput.svelte'
	import Button from '$lib/Form/Button.svelte'

	const dispatcher = createEventDispatcher()

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
		dispatcher('submit')
		if (restoreResult?.total) {
			console.log('Successfully restored backup')
		} else {
			throw new Error('Failed to restore backup')
		}
	}
</script>

<Wrapper>
	<span slot="title">Secure Backup</span>
	<p>Input a Security Key.</p>
	<Form on:submit={submit}>
		<TextInput type="text" label="Security Phrase" bind:value={securityKey} />
		<Button type="submit">Submit</Button>
	</Form>
</Wrapper>
