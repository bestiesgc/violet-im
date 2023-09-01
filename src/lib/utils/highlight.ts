let hljs: typeof import('highlight.js').default
let hljsPromise = import('highlight.js').then(({ default: module }) => {
	hljs = module
})

async function highlight(lang: string, code: string): Promise<string> {
	await hljsPromise
	return hljs.highlight(code, {
		language: lang
	}).value
}

export async function highlightElement(element: HTMLElement): Promise<void> {
	await hljsPromise
	hljs.highlightElement(element)
}

export default highlight
