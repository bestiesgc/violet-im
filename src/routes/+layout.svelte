<script>
	import { browser } from '$app/environment'
	import '../reset.postcss'
	import '../app.postcss'
	if (browser) {
		window.global ||= window
	}
</script>

<slot />
