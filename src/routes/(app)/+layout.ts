import { redirect } from '@sveltejs/kit'
import client from '$lib/client/index'
import { goto } from '$app/navigation'

export const ssr = false

export async function load() {
	const loggedIn = localStorage.getItem('token') != null
	if (!loggedIn) {
		throw redirect(307, '/login')
	}
	try {
		await client.start()
	} catch (error) {
		localStorage.clear()
		console.error(error)
		goto('/login')
		return
	}
}
