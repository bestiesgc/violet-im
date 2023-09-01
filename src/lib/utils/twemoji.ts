let twemoji: typeof import('@twemoji/api')

let promise = import('@twemoji/api').then(({ default: module }) => {
	twemoji = module
	// @ts-ignore
	twemoji.ext = '.svg'
	// @ts-ignore
	twemoji.size = 'svg'
})

export async function parse(elem: HTMLElement) {
	await promise
	// @ts-ignore
	twemoji.parse(elem)
}

export default {
	parse
}
