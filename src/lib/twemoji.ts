import twemoji from '@twemoji/api'
// @ts-ignore
twemoji.ext = '.svg'
// @ts-ignore
twemoji.size = 'svg'

export function parse(elem: HTMLElement) {
	// @ts-ignore
	twemoji.parse(elem)
}

export default {
	parse
}
