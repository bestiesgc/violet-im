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
	],
	build: {
		rollupOptions: {
			external: [],
			output: {
				inlineDynamicImports: false,
				manualChunks(_id) {
					if (!_id.includes('node_modules')) {
						return
					}
					if (
						_id.includes('svelte') ||
						_id.includes('cookie') ||
						_id.includes('devalue') ||
						_id.includes('esm-env') ||
						_id.includes('mousetrap')
					) {
						return 'svelte'
					}
					if (
						_id.includes('vite-plugin-node-polyfills') ||
						_id.includes('node-stdlib-browser') ||
						_id.includes('buffer') ||
						_id.includes('browserify') ||
						_id.includes('uuid') ||
						_id.includes('base64-js') ||
						_id.includes('ieee754') ||
						_id.includes('readable-stream') ||
						_id.includes('string_decoder') ||
						_id.includes('sha.js')
					) {
						return 'node-polyfills'
					}
					if (_id.includes('highlight.js')) {
						return 'highlight'
					}
					if (
						_id.includes('matrix-js-sdk') ||
						(_id.includes('babel') && _id.includes('runtime'))
					) {
						return 'matrix-js-sdk'
					}
					if (
						_id.includes('matrix-widget-api') ||
						_id.includes('matrix-events-sdk') ||
						_id.includes('matrix-encrypt-attachment')
					) {
						return 'matrix-etc'
					}
					if (
						_id.includes('crypto') ||
						_id.includes('hash.js') ||
						_id.includes('elliptic') ||
						_id.includes('asn1') ||
						_id.includes('diffie-hellman') ||
						_id.includes('encrypt')
					) {
						return 'crypto'
					}
					return 'misc'
				}
			}
		}
	}
})
