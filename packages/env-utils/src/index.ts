import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export function loadDotEnv(callerImportMetaUrl: string): void {
	try {
		const dir = dirname(fileURLToPath(callerImportMetaUrl));
		const envPath = resolve(dir, '../.env');
		const contents = readFileSync(envPath, 'utf-8');
		for (const line of contents.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eqIndex = trimmed.indexOf('=');
			if (eqIndex === -1) continue;
			const key = trimmed.slice(0, eqIndex).trim();
			const value = trimmed.slice(eqIndex + 1).trim();
			if (!(key in process.env)) {
				process.env[key] = value;
			}
		}
	} catch {
		// .env is optional
	}
}

export function parseDotEnv(
	callerImportMetaUrl: string,
): Record<string, string> {
	const vars: Record<string, string> = {};
	try {
		const dir = dirname(fileURLToPath(callerImportMetaUrl));
		const envPath = resolve(dir, '../.env');
		const contents = readFileSync(envPath, 'utf-8');
		for (const line of contents.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eqIndex = trimmed.indexOf('=');
			if (eqIndex === -1) continue;
			const key = trimmed.slice(0, eqIndex).trim();
			const value = trimmed.slice(eqIndex + 1).trim();
			vars[key] = value;
		}
	} catch {
		// .env is optional
	}
	return vars;
}

export function fileExists(path: string): boolean {
	return existsSync(path);
}
