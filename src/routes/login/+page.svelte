<script>
	import { onMount } from 'svelte'
	import Form from '$lib/Form/Form.svelte'
	import TextInput from '$lib/Form/TextInput.svelte'
	import Button from '$lib/Form/Button.svelte'

	let sdk
	let homeserver = 'matrix.org'
	let username = ''
	let password = ''

	onMount(async () => {
		sdk = await import('matrix-js-sdk')
	})

	async function login(e) {
		e.preventDefault()
		let homeserverUrl = homeserver
		if (!/^https?:\/\//.test(homeserverUrl)) {
			homeserverUrl = 'https://' + homeserverUrl
		}
		const homeserverClientResponse = await fetch(
			`${homeserverUrl}/.well-known/matrix/client`
		)
		const homeserverClientJson = (await homeserverClientResponse.json())[
			'm.homeserver'
		]
		const client = sdk.createClient({
			baseUrl: homeserverClientJson.base_url
		})
		const session = await client.login('m.login.password', {
			identifier: {
				type: 'm.id.user',
				user: username
			},
			password,
			initial_device_display_name: 'violet-im'
		})
		localStorage.setItem('homeserver', client.baseUrl)
		localStorage.setItem('token', session.access_token)
		localStorage.setItem('user_id', session.user_id)
		localStorage.setItem('device_id', session.device_id)
	}
</script>

<div class="center">
	<div class="login-wrapper">
		<p class="title">login</p>
		<Form on:submit={login}>
			<TextInput label="homeserver" bind:value={homeserver} />
			<TextInput label="username" bind:value={username} />
			<TextInput label="password" type="password" bind:value={password} />
			<Button type="submit">login</Button>
		</Form>
	</div>
</div>

<style lang="postcss">
	.center {
		display: grid;
		place-items: center;
		height: 100%;
	}
	.login-wrapper {
		background-color: var(--slate-900);
		width: 100%;
		max-width: 18rem;
		padding: 1rem;
		border-radius: 0.25rem;
	}
	.login-wrapper .title {
		user-select: none;
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.5em;
		color: var(--slate-50);
	}
</style>
