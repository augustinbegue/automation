import { z } from 'zod';

export const envSchema = z.record(z.string(), z.any());

export const actionSchema = z.object({
	type: z.string(),
	shell: z.string().optional(),
	env: envSchema.optional(),
	script: z.string().optional()
});

export const actionReferenceSchema = z.object({
	id: z.string(),
	env: envSchema.optional()
});

export const jobSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	actions: z.array(actionReferenceSchema),
	schedule: z.string().optional(),
	secret: z.string().optional(),
	env: envSchema.optional()
});

export const configSchema = z.object({
	jobs: z.record(z.string(), jobSchema),
	actions: z.record(z.string(), actionSchema)
});

export type ConfigSchema = z.infer<typeof configSchema>;
