import client from '$lib/client/index'
import DOMPurify from 'dompurify'
import twemoji from '$lib/utils/twemoji'
import { highlightElement } from '$lib/utils/highlight'

function linkPrettier(url: string) {
	return url.replace(/^[a-zA-Z]+?:\/\//, '').replace(/\/$/, '')
}

export function parseBody(body: string) {
	const parser = new DOMParser()
	const bodyDoc = parser.parseFromString(
		`<html><body>${body.replace(/\n(<pre>)/gm, '$1')}</body></html>`,
		'text/html'
	)
	twemoji.parse(bodyDoc.body)
	bodyDoc.querySelectorAll('img[data-mx-emoticon]').forEach(img => {
		img.classList.add('emoji')
		img.removeAttribute('width')
		img.removeAttribute('height')
		let src = img.getAttribute('src')
		if (!src) throw new Error('Invalid img tag')
		if (src.startsWith('mxc://')) src = client.matrixClient.mxcUrlToHttp(src)
		if (!src) throw new Error('Invalid img url')
		img.setAttribute('src', src)
	})
	bodyDoc.querySelectorAll('style, script').forEach(el => {
		el.replaceWith(el.outerHTML)
	})
	bodyDoc.querySelectorAll('mx-reply').forEach(reply => {
		reply.remove()
	})
	bodyDoc.querySelectorAll('a').forEach(a => {
		a.setAttribute('target', '_blank')
		a.setAttribute('rel', 'noopener noreferrer')
		if (a.innerText != a.getAttribute('href')) {
			const text = a.innerText
			a.innerText = linkPrettier(a.getAttribute('href') ?? '')
			a.replaceWith('[' + text + '](', a, ')')
		} else {
			a.innerText = linkPrettier(a.getAttribute('href') ?? '')
		}
	})
	let codePromise: Promise<string> | null = null
	if (bodyDoc.querySelector('pre code[class^="language-"]')) {
		codePromise = (async () => {
			await Promise.allSettled(
				[...bodyDoc.querySelectorAll('pre code[class^="language-"]')].map(el =>
					highlightElement(<HTMLElement>el)
				)
			)
			return DOMPurify.sanitize(bodyDoc.body.innerHTML, {
				FORBID_TAGS: ['style']
			}).trim()
		})()
	}
	return {
		text: DOMPurify.sanitize(bodyDoc.body.innerHTML, {
			FORBID_TAGS: ['style']
		}).trim(),
		codePromise
	}
}

export function isAllEmoji(body: string) {
	const parser = new DOMParser()
	const bodyDoc = parser.parseFromString(body, 'text/html')
	let allEmoji = false
	if (bodyDoc.querySelector('img.emoji')) {
		allEmoji = true
	}
	bodyDoc.body.childNodes.forEach(node => {
		if (node.nodeType === Node.TEXT_NODE) {
			allEmoji = false
		} else if (
			node.nodeName != 'IMG' ||
			!(<HTMLElement>node).classList?.contains('emoji')
		) {
			allEmoji = false
		}
	})
	return allEmoji
}
