import client from '$lib/client/index'
import DOMPurify from 'dompurify'
import twemoji from '$lib/twemoji'

function linkPrettier(url: string) {
	return url.replace(/^[a-zA-Z]+?:\/\//, '').replace(/\/$/, '')
}

export function parseBody(body: string) {
	const parser = new DOMParser()
	const bodyDoc = parser.parseFromString(body, 'text/html')
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
	return DOMPurify.sanitize(bodyDoc.body.innerHTML, {
		FORBID_TAGS: ['style']
	}).trim()
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
			console.log(node)
			allEmoji = false
		}
	})
	console.log(body, allEmoji)
	return allEmoji
}
