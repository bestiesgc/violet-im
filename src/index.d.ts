declare module '*.svg?c' {
	import { ComponentType, SvelteComponent } from 'svelte'
	const icon: ComponentType<SvelteComponent>
	export default icon
}
