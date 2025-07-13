import type { WebhookConfig } from '$lib/server/automation/config';

export type PageData = {
	webhook: Pick<WebhookConfig, 'id' | 'name' | 'description' | 'schedule'>;
};

export type Params = {
	id: string;
};
