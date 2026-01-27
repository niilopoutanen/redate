import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ["./server/common", "./build"],
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
