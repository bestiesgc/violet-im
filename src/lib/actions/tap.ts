function preventDefault(event: Event) {
	event.preventDefault()
}

export function holdtap(node: Node, callback: (event?: Event) => void) {
	let timer: number | null
	function onTouchStart(event: Event) {
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
		if (timer) clearTimeout(timer)
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

export function tap(node: Node, callback: (event?: Event) => void) {
	function onTouchEnd(event: Event) {
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
