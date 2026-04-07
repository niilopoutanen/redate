import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		headers: {
			'cache-control': 'no-store'
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern",
			}
		}
	}
});
