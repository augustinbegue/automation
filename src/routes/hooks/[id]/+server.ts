import { executeAction, type ActionResult } from '$lib/server/automation/actions';
import { getAction, getJob } from '$lib/server/automation/config';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const webhook = getJob(params.id);

	if (!webhook) {
		throw error(404, 'Webhook not found');
	}

	// Verify secret if configured
	const secret = webhook.secret || process.env.SECRET;
	if (secret) {
		const authHeader = request.headers.get('x-webhook-secret');
		if (authHeader !== secret) {
			throw error(401, 'Invalid webhook secret');
		}
	}

	const envHeader = JSON.parse((await request.text()) || '{}');

	// Execute all actions configured for this webhook
	const promises: Promise<ActionResult>[] = [];
	for (const actionConfig of webhook.actions) {
		const action = getAction(actionConfig.id);
		if (!action) return error(500, 'Invalid configuration');
		action.env = {
			...action.env,
			...webhook.env,
			...actionConfig.env,
			...envHeader
		};

		console.log('Executing action', action);

		promises.push(executeAction(action));
	}

	const results = await Promise.all(promises);

	return json({
		success: true,
		webhook: webhook.name,
		results
	});
};
