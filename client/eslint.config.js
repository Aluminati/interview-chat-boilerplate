import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				tsconfigRootDir: __dirname,
			},
		},
	},
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
			'vue/multi-word-component-names': 'off',
			'vue/html-indent': 'off',
			'vue/script-indent': 'off',
			'vue/max-attributes-per-line': 'off',
			'vue/first-attribute-linebreak': 'off',
			'vue/html-closing-bracket-newline': 'off',
			'vue/html-self-closing': 'off',
			'vue/singleline-html-element-content-newline': 'off',
			'vue/multiline-html-element-content-newline': 'off',
			'vue/html-closing-bracket-spacing': 'off',
			'vue/mustache-interpolation-spacing': 'off',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
];
