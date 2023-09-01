let hljsImport = import('highlight.js')
let hljs: typeof import('highlight.js').default

async function highlight(lang: string, code: string): Promise<string> {
	hljs = (await hljsImport).default
	return hljs.highlight(code, {
		language: lang
	}).value
}

export default highlight
