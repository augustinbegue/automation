import { $, randomUUIDv7 } from 'bun';
import type { ActionResult, BaseActionConfig } from '.';

export const actionName = 'run-shell-script' as const;

export interface RunShellScriptConfig extends BaseActionConfig {
	type: typeof actionName;
	script: string;
	workingDirectory?: string;
	timeout?: number;
	shell?: string;
}

export const runAction = async (config: RunShellScriptConfig): Promise<ActionResult> => {
	try {
		const { script, workingDirectory, shell = '/bin/sh', env = {} } = config;

		const scriptFilePath = `/tmp/automation-${config.type}-${randomUUIDv7()}.sh`;
		const scriptFile = Bun.file(scriptFilePath);
		await Bun.write(scriptFile, script);

		let cmd = $`${shell} ${scriptFilePath}`.env({
			...(process.env as Record<string, string>),
			...env
		});
		if (workingDirectory) cmd = cmd.cwd(workingDirectory);

		const res = await cmd.text();

		await scriptFile.delete();

		return {
			success: true,
			output: res
		};
	} catch (error) {
		if (error instanceof Error && 'stderr' in error) {
			const execError = error as { stderr: string };
			return {
				success: false,
				error: error.message,
				output: execError.stderr
			};
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
};
