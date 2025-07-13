import { fileURLToPath } from 'bun';
import fs from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { Logger } from 'tslog';

const log = new Logger({ name: 'actions' });

export interface BaseActionConfig {
	type: string;
	name: string;
	env?: Record<string, string>;
	description?: string;
}

export interface ActionResult {
	success: boolean;
	output?: string;
	error?: string;
}

export type ActionHandler = (config: BaseActionConfig) => Promise<ActionResult>;

interface ActionModule {
	actionName: string;
	runAction: ActionHandler;
}

const actionHandlers = new Map<string, ActionHandler>();

function importAction(actionName: string): Promise<ActionModule> {
	return import(`./action-${actionName}.ts`);
}

export async function loadActions() {
	const actionsDir = path.join(dirname(fileURLToPath(import.meta.url)));
	const files = await fs.readdir(actionsDir);

	for (const file of files) {
		if (file === 'index.ts' || !file.endsWith('.ts')) continue;

		try {
			const module = await importAction(file.replace('action-', '').replace('.ts', ''));

			if (module.actionName && module.runAction) {
				actionHandlers.set(module.actionName, module.runAction);
				log.info(`Loaded action: ${module.actionName}`);
			}
		} catch (error) {
			log.error(`Failed to load action from ${file}:`, error);
		}
	}
}

export async function executeAction(config: BaseActionConfig): Promise<ActionResult> {
	const handler = actionHandlers.get(config.type);
	if (!handler) {
		return {
			success: false,
			error: `No handler registered for action type: ${config.type}`
		};
	}

	try {
		return await handler(config);
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

// Export all action configs for type checking
export type { RunShellScriptConfig } from './action-run-shell-script';
