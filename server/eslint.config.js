import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
);
