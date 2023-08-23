import { redirect } from '@sveltejs/kit'

export async function load() {
	const loggedIn = localStorage.getItem('token') != null
	if (loggedIn) {
		throw redirect(307, '/')
	}
}
