import { readable } from 'svelte/store'
import { useMediaQuery } from './utils/media'

export const finePointer = useMediaQuery('(pointer: fine)')

type Viewport = {
	width: number
	height: number
	scale: number
	offsetTop: number
	offsetLeft: number
	pageLeft: number
	pageTop: number
}

export const visualViewport = readable(<Viewport | null>null, set => {
	function onResize() {
		const viewport = window.visualViewport ?? {
			width: window.innerWidth,
			height: window.innerHeight,
			scale: 1.0,
			offsetTop: 0,
			offsetLeft: 0,
			pageLeft: 0,
			pageTop: 0
		}
		set(viewport)
	}
	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', onResize)
		window.visualViewport.addEventListener('scroll', onResize)
	} else {
		window.addEventListener('resize', onResize)
	}
	return () => {
		if (window.visualViewport) {
			window.visualViewport.removeEventListener('resize', onResize)
			window.visualViewport.removeEventListener('scroll', onResize)
		} else {
			window.removeEventListener('resize', onResize)
		}
	}
})
