import { z } from 'zod';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadDotEnv } from '@interview-chat/env-utils';
import { log } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadDotEnv(import.meta.url);

const EnvSchema = z.object({
	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
	CLIENT_URL: z.string().url(),
	DB_PATH: z
		.string()
		.min(1)
		.default('./chat.db')
		.refine(
			(p) => existsSync(resolve(__dirname, '..', p)),
			(p) => ({
				message: `DB file not found at ${resolve(__dirname, '..', p)}`,
			}),
		),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
});

function parseEnv(): z.infer<typeof EnvSchema> {
	const result = EnvSchema.safeParse(process.env);

	if (!result.success) {
		log.error('Invalid environment variables:');

		for (const issue of result.error.issues) {
			log.error(`  ${issue.path.join('.')}: ${issue.message}`);
		}

		process.exit(1);
	}
	return result.data;
}

export const env = parseEnv();

if (process.argv[1] && __filename === resolve(process.argv[1])) {
	log.info('Environment variables are valid.');
}
