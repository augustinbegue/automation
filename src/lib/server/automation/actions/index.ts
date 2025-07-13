import { Logger } from 'tslog';

import * as runShellScript from './action-run-shell-script';

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

const actionModules = [runShellScript] as ActionModule[];
const actionHandlers = new Map<string, ActionHandler>();

export async function loadActions() {
	for (const module of actionModules) {
		if (module.actionName && module.runAction) {
			actionHandlers.set(module.actionName, module.runAction);
			log.info(`Loaded action: ${module.actionName}`);
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
