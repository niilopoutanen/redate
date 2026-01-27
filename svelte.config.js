import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		files: {
			lib: 'electron/lib',
			routes: 'electron/routes',
			assets: 'electron/static',
			appTemplate: 'electron/app.html',
		}
	}
};

export default config;
