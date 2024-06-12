import { resolve } from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import glsl from 'vite-plugin-glsl'

const src_dir = resolve(__dirname, "src")

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				'@': src_dir
			},
			extensions: [".js", ".jsx", ".ts", ".tsx"]
		},
		define: { __ENV__: JSON.stringify(<string>process.env.ENV) },
		server: {
			host: "127.0.0.1",
			port: 3347,
			proxy: {
				'*': {
					rewrite: () => {
						return "/index.html"
					}
				}
			}
		},
		build: {
			sourcemap: true,
			outDir: resolve(__dirname, "dist"),
			assetsDir: "",
			rollupOptions: {
				input: resolve(__dirname, "index.html"),
				output: {
					entryFileNames: "[name].js",
					chunkFileNames: "[name].js",
					assetFileNames: "[name][extname]"
				}
			}
		},
		plugins: [
			react(),
			glsl({ include: ['**/*.wgsl'] })
		]
	}
})