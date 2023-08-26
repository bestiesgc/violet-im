function preventDefault(event) {
	event.preventDefault()
}

export function holdtap(node, callback) {
	let timer
	function onTouchStart(event) {
		timer = setTimeout(() => {
			timer = null
			// prevent context menu from showing within 1s of the holdtap
			document.addEventListener('contextmenu', preventDefault)
			setTimeout(() => {
				document.removeEventListener('contextmenu', preventDefault)
			}, 1000)
			callback(event)
		}, 500)
	}
	node.addEventListener('touchstart', onTouchStart)

	function cancel() {
		clearTimeout(timer)
	}

	node.addEventListener('touchend', cancel)
	node.addEventListener('touchmove', cancel)
	return {
		destroy: () => {
			node.removeEventListener('touchstart', onTouchStart)
			node.removeEventListener('touchend', cancel)
			node.removeEventListener('touchmove', cancel)
		}
	}
}

export function tap(node, callback) {
	function onTouchEnd(event) {
		callback(event)
		cancel()
	}
	function onTouchStart() {
		node.addEventListener('touchend', onTouchEnd)
		setTimeout(() => {
			cancel()
		}, 500)
	}
	function cancel() {
		node.removeEventListener('touchend', onTouchEnd)
		node.removeEventListener('touchmove', cancel)
	}
	node.addEventListener('touchstart', onTouchStart)
	node.addEventListener('touchmove', cancel)
	return {
		destroy: () => {
			node.removeEventListener('touchstart', onTouchStart)
			cancel()
		}
	}
}
