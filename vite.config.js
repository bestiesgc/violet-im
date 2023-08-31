import svelteSVG from 'vite-plugin-svelte-svg'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [
				// Enable esbuild polyfill plugins
				NodeGlobalsPolyfillPlugin({
					process: false,
					buffer: true
				})
			]
		}
	},
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
		sveltekit()
	]
})
