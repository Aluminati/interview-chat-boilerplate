import { z } from 'zod';

const EnvSchema = z.object({
	VITE_API_BASE_URL: z.string().url(),
});

function parseEnv(): z.infer<typeof EnvSchema> {
	const raw = {
		VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
	};

	const result = EnvSchema.safeParse(raw);
	if (!result.success) {
		const messages = result.error.issues
			.map((i) => `  ${i.path.join('.')}: ${i.message}`)
			.join('\n');
		throw new Error(`Invalid environment variables:\n${messages}`);
	}
	return result.data;
}

export const env = parseEnv();
