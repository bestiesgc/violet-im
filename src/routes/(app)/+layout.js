import { redirect } from '@sveltejs/kit'
import { start } from '$lib/client/index.js'

export const ssr = false

export async function load() {
	const loggedIn = localStorage.getItem('token') != null
	if (!loggedIn) {
		throw redirect(307, '/login')
	}
	await start()
}
