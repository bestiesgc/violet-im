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
