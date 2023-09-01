// https://gist.github.com/paoloricciuti/94a7920e276c06235ceac4026b85db21#file-usemediaquerystore-js
import { readable } from 'svelte/store'

export const useMediaQuery = (mediaQueryString: string) => {
	const matches = readable(<boolean | null>null, set => {
		const m = window.matchMedia(mediaQueryString)
		set(m.matches)
		const listener = (e: MediaQueryListEvent) => set(e.matches)
		m.addEventListener('change', listener)
		return () => {
			m.removeEventListener('change', listener)
		}
	})
	return matches
}
