import { z } from 'zod';
import { parseDotEnv } from '@interview-chat/env-utils';

const EnvSchema = z.object({
	VITE_API_BASE_URL: z.string().url(),
});

const raw = { ...parseDotEnv(import.meta.url), ...process.env };

const result = EnvSchema.safeParse(raw);
if (!result.success) {
	console.error('Invalid environment variables:');
	for (const issue of result.error.issues) {
		console.error(`  ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}

console.info('Client environment variables are valid.');
