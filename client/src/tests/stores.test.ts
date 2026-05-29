import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useChatsStore } from '../stores/chats';

vi.mock('../api', () => ({
	api: {
		users: {
			search: vi.fn().mockResolvedValue([]),
			create: vi.fn().mockResolvedValue({
				id: 1,
				username: 'alice',
				display_name: 'Alice',
				created_at: '2024-01-01T00:00:00.000Z',
			}),
		},
		chats: {
			list: vi.fn().mockResolvedValue([]),
			messages: vi.fn().mockResolvedValue([]),
			sendMessage: vi.fn().mockResolvedValue({
				id: 1,
				chat_id: 1,
				sender_id: 1,
				sender_username: 'alice',
				sender_display_name: 'Alice',
				content: 'Hello',
				sent_at: '2024-01-01T00:00:00.000Z',
			}),
			create: vi.fn().mockResolvedValue({
				id: 1,
				name: 'Test Chat',
				participant_usernames: 'alice,bob',
				created_at: '2024-01-01T00:00:00.000Z',
			}),
		},
	},
}));

describe('Auth store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		localStorage.clear();
	});

	it('starts with no user', () => {
		const auth = useAuthStore();
		expect(auth.currentUser).toBeNull();
	});

	it('login sets currentUser', async () => {
		const auth = useAuthStore();
		await auth.login('alice', 'Alice');
		expect(auth.currentUser).not.toBeNull();
		expect(auth.currentUser?.username).toBe('alice');
	});

	it('logout clears currentUser', async () => {
		const auth = useAuthStore();
		await auth.login('alice', 'Alice');
		auth.logout();
		expect(auth.currentUser).toBeNull();
	});
});

describe('Chats store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('starts with empty chats', () => {
		const chats = useChatsStore();
		expect(chats.chats).toEqual([]);
	});

	it('fetchChats populates chats list', async () => {
		const chats = useChatsStore();
		await chats.fetchChats(1);
		expect(Array.isArray(chats.chats)).toBe(true);
	});

	it('sendMessage adds message to list when activeChat is set', async () => {
		const chatsStore = useChatsStore();
		chatsStore.activeChat = {
			id: 1,
			name: 'Test',
			participant_usernames: 'alice,bob',
			created_at: '2024-01-01T00:00:00.000Z',
		};
		await chatsStore.sendMessage(1, 'Hello');
		expect(chatsStore.messages).toHaveLength(1);
		expect(chatsStore.messages[0].content).toBe('Hello');
	});
});
