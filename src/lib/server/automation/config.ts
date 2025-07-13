import { Logger } from 'tslog';
import type { BaseActionConfig } from './actions';
import { configSchema } from './schema';

const log = new Logger({ name: 'automation-config' });

export interface JobConfig {
	id: string;
	name: string;
	description?: string;
	actions: Array<{ id: string; env?: Record<string, string> }>;
	schedule?: string;
	secret?: string;
	env?: Record<string, string>;
}

export interface ActionDefinition extends BaseActionConfig {
	id: string;
}

export interface AutomationConfig {
	jobs: Record<string, JobConfig>;
	actions: Record<string, ActionDefinition>;
}

let config: AutomationConfig = {
	jobs: {},
	actions: {}
};

export function loadConfig(parsedConfig: unknown) {
	try {
		const validationResult = configSchema.safeParse(parsedConfig);

		if (!validationResult.success) {
			log.error('Configuration validation failed:');
			validationResult.error.issues.forEach((issue) => {
				log.error(`  - ${issue.path.join('.')}: ${issue.message}`);
			});
			throw new Error('Invalid configuration file');
		}

		// Transform the validated config into our internal format
		const validatedConfig = validationResult.data;

		// Convert jobs from record to our internal format with IDs
		const transformedJobs: Record<string, JobConfig> = {};
		Object.entries(validatedConfig.jobs).forEach(([id, job]) => {
			transformedJobs[id] = {
				...job,
				id
			};
		});

		// Convert actions from record to our internal format with IDs
		const transformedActions: Record<string, ActionDefinition> = {};
		Object.entries(validatedConfig.actions).forEach(([id, action]) => {
			transformedActions[id] = {
				...action,
				id,
				name: id
			};
		});

		config = {
			jobs: transformedJobs,
			actions: transformedActions
		};

		const jobCount = Object.keys(config.jobs).length;
		const actionCount = Object.keys(config.actions).length;
		log.info(`Loaded ${actionCount} actions and ${jobCount} jobs`);

		Object.values(config.jobs).forEach((job) => {
			log.info(
				`  - ${job.name} (${job.id}): ${job.actions.length} actions${job.schedule ? `, schedule: ${job.schedule}` : ''}`
			);
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to parse configuration: ${error.message}`);
		}
		throw error;
	}
}

export function getJob(id: string): JobConfig | undefined {
	return config.jobs[id];
}

export function getJobs(): JobConfig[] {
	return Object.values(config.jobs);
}

export function getAction(id: string): ActionDefinition | undefined {
	return config.actions[id];
}

export function getActions(): ActionDefinition[] {
	return Object.values(config.actions);
}
