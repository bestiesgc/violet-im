import { redirect } from '@sveltejs/kit'
import { loadClient } from '$lib/client/load.js'

export const ssr = false

export async function load() {
	const loggedIn = localStorage.getItem('token') != null
	if (!loggedIn) {
		throw redirect(307, '/login')
	}
	await loadClient()
}
