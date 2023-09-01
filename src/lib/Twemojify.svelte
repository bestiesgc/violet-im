<script lang="ts">
	import twemoji from '$lib/utils/twemoji'

	export let text: string
	let elem: HTMLElement

	$: if (elem) {
		twemoji.parse(elem)
	}
</script>

<span bind:this={elem}>{text}</span>
