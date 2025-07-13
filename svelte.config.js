import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'svelte-adapter-bun';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		files: {
			hooks: {
				client: 'src/lib/hooks/client.ts',
				server: 'src/lib/hooks/server.ts',
				universal: 'src/lib/hooks/universal.ts'
			}
		}
	}
};

export default config;
