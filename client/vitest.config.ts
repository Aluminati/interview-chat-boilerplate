import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	define: {
		'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
			'http://localhost:3000',
		),
	},
	test: {
		environment: 'jsdom',
		globals: true,
	},
});
