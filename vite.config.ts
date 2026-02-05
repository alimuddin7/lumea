import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		include: ['monaco-editor']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					monaco: ['monaco-editor']
				}
			}
		}
	},
	worker: {
		format: 'es'
	}
});
