let hljsImport = import('highlight.js')

async function highlight(lang: string, code: string): Promise<string> {
	const hljs = (await hljsImport).default
	return hljs.highlight(code, {
		language: lang
	}).value
}

export async function highlightElement(element: HTMLElement): Promise<void> {
	const hljs = (await hljsImport).default
	hljs.highlightElement(element)
}

export default highlight
