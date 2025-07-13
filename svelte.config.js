import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
