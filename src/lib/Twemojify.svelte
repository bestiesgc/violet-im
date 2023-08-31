<script lang="ts">
	import twemoji from '@twemoji/api'

	export let text: string
	let elem: Element

	$: if (elem) {
		// @ts-ignore
		twemoji.parse(elem)
	}
</script>

<span bind:this={elem}>{text}</span>
