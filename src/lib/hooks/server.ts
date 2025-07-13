import { loadActions } from '$lib/server/automation/actions';
import { loadConfig } from '$lib/server/automation/config';
import type { Handle } from '@sveltejs/kit';
import { load } from 'js-yaml';
import fs from 'node:fs/promises';
import { Logger } from 'tslog';

const log = new Logger({ name: 'server-hooks' });

let isInitialized = false;

async function initialize() {
	if (isInitialized) return;

	try {
		// Load action handlers
		log.info('Loading action handlers...');
		await loadActions();

		// Load webhook configuration
		log.info('Loading configuration...');
		const configPath = process.env.CONFIG_PATH || process.cwd() + '/automation.config.yaml';
		const configData = await fs.readFile(configPath, 'utf-8');
		const parsedConfig = load(configData);
		loadConfig(parsedConfig);

		isInitialized = true;
		log.info('Initialization complete');
	} catch (error) {
		log.error('Initialization failed');
		throw error;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	await initialize();
	return await resolve(event);
};
