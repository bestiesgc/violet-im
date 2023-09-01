import svelteSVG from 'vite-plugin-svelte-svg'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [
		svelteSVG({
			svgoConfig: {
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								removeViewBox: false,
								cleanupIds: false
							}
						}
					}
				]
			},
			requireSuffix: false
		}),
		sveltekit(),
		nodePolyfills({
			include: [],
			globals: {
				Buffer: true,
				global: true,
				process: false
			}
		})
	]
})
