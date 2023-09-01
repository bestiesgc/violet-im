<script lang="ts">
	import type { Crypto, User } from 'matrix-js-sdk'
	import Avatar from '$lib/Member/Avatar.svelte'
	import CheckIcon from '$lib/Icons/check.svg?c'
	import CloseIcon from '$lib/Icons/close.svg?c'
	import client from '$lib/client'
	import { verificationMethods } from 'matrix-js-sdk/lib/crypto'
	import { VerifierEvent, type Verifier } from 'matrix-js-sdk/lib/crypto-api'
	import Twemojify from '$lib/Twemojify.svelte'

	export let request: Crypto.VerificationRequest | undefined

	let otherUser: User
	let verifier: Verifier
	$: {
		if (request?.otherUserId) {
			const user = client.matrixClient.getUser(request.otherUserId)
			if (user) otherUser = user
		}
	}

	async function accept() {
		if (request) {
			await request.accept()
			verifier = request.beginKeyVerification(verificationMethods.SAS)
		}
	}
	async function deny() {
		if (request) await request.cancel()
		request = undefined
	}

	function loadVerifier(): Promise<Crypto.ShowSasCallbacks> {
		return new Promise((resolve, reject) => {
			let done = false
			verifier.once(VerifierEvent.ShowSas, sasData => {
				if (!sasData.sas?.emoji) {
					reject('No emoji')
				} else {
					resolve(sasData)
					done = true
				}
			})
			verifier.once(VerifierEvent.Cancel, () => {
				request = undefined
				reject('Cancelled')
				done = true
			})
			verifier.verify().finally(() => {
				request = undefined
			})
			setTimeout(() => {
				if (!done) reject('Timed out')
			}, 20000)
		})
	}
</script>

{#if request && !verifier}
	<div class="verifier verification">
		{#if otherUser}
			<Avatar member={otherUser} size={96}></Avatar>
		{/if}
		<div class="text">
			<p>
				{otherUser.userId == client.getUserId() ? 'You' : otherUser.displayName}
				sent a verification request.
			</p>
		</div>
		<div class="actions">
			<button on:click={accept}>
				<span class="sr-only">Accept</span>
				<CheckIcon aria-hidden="true"></CheckIcon>
			</button>
			<button on:click={deny}>
				<span class="sr-only">Deny</span>
				<CloseIcon aria-hidden="true"></CloseIcon>
			</button>
		</div>
	</div>
{:else if verifier}
	{#await loadVerifier()}
		<div class="verifier validate loading">
			<p>
				Waiting for {otherUser.userId == client.getUserId()
					? 'you'
					: otherUser.displayName} to accept...
			</p>
		</div>
	{:then sasData}
		<div class="verifier validate">
			<p>Validate emoji</p>
			<div class="emoji">
				{#each sasData.sas.emoji ?? [] as emoji}
					<Twemojify text={emoji[0]}></Twemojify>
				{/each}
			</div>
			<div class="actions">
				<button
					on:click={() => {
						sasData.confirm()
					}}
				>
					<span class="sr-only">Confirm</span>
					<CheckIcon aria-hidden="true"></CheckIcon>
				</button>
				<button
					on:click={() => {
						sasData.mismatch()
					}}
				>
					<span class="sr-only">Reject</span>
					<CloseIcon aria-hidden="true"></CloseIcon>
				</button>
			</div>
		</div>
	{/await}
{/if}

<style lang="postcss">
	.verification {
		display: grid;
		grid-template-columns: 4rem 1fr;
		grid-template-rows: 2rem 2rem;
		column-gap: 1rem;
		row-gap: 0.25rem;
		padding: 1rem;
	}
	.validate {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem;
	}
	.emoji {
		margin: 1rem 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
	}
	.emoji :global(.emoji) {
		width: 2rem;
		height: 2rem;
	}
	.text {
		display: flex;
		align-items: center;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-start;
		align-items: flex-end;
		grid-column: 2;
	}
	.actions button {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
	}

	.verification :global(.avatar) {
		border-radius: 0.5rem;
		grid-row: 1 / -1;
		grid-column: 1;
		height: auto;
	}
</style>
