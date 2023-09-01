const ATTR_REGEX = /[&"]/g
const CONTENT_REGEX = /[&<]/g

export function escape(value: string, is_attr = false) {
	const str = String(value)
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX
	pattern.lastIndex = 0
	let escaped = ''
	let last = 0
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1
		const ch = str[i]
		escaped +=
			str.substring(last, i) +
			(ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;')
		last = i + 1
	}
	return escaped + str.substring(last)
}

export function decodeEntities(encoded: string) {
	let translate_re = /&(nbsp|amp|quot|lt|gt);/g
	let translate: { [key: string]: string } = {
		nbsp: ' ',
		amp: '&',
		quot: '"',
		lt: '<',
		gt: '>'
	}
	return encoded
		.replace(translate_re, function (match, entity) {
			return translate[entity]
		})
		.replace(/&#(\d+);/gi, function (match, numStr) {
			let num = parseInt(numStr, 10)
			return String.fromCharCode(num)
		})
}
