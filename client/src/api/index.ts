import { env } from '../env';
import type { Chat, Message, User } from '../types';

const BASE = env.VITE_API_BASE_URL;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		headers: { 'Content-Type': 'application/json', ...init?.headers },
		...init,
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body?.error ?? `HTTP ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export const api = {
	users: {
		list: (): Promise<User[]> => fetchJson('/api/users'),
		search: (q: string): Promise<User[]> =>
			fetchJson(`/api/users/search?q=${encodeURIComponent(q)}`),
		get: (id: number): Promise<User> => fetchJson(`/api/users/${id}`),
		create: (username: string, display_name: string): Promise<User> =>
			fetchJson('/api/users', {
				method: 'POST',
				body: JSON.stringify({ username, display_name }),
			}),
	},

	chats: {
		list: (userId?: number): Promise<Chat[]> =>
			fetchJson(
				`/api/chats${userId != null ? `?user_id=${userId}` : ''}`,
			),
		get: (id: number): Promise<Chat> => fetchJson(`/api/chats/${id}`),
		create: (
			name: string | undefined,
			participant_ids: number[],
		): Promise<Chat> =>
			fetchJson('/api/chats', {
				method: 'POST',
				body: JSON.stringify({ name, participant_ids }),
			}),
		messages: (chatId: number, since?: string): Promise<Message[]> =>
			fetchJson(
				`/api/chats/${chatId}/messages${since ? `?since=${encodeURIComponent(since)}` : ''}`,
			),
		sendMessage: (
			chatId: number,
			sender_id: number,
			content: string,
		): Promise<Message> =>
			fetchJson(`/api/chats/${chatId}/messages`, {
				method: 'POST',
				body: JSON.stringify({ sender_id, content }),
			}),
	},
};
