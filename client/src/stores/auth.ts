import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types';
import { api } from '../api';

export const useAuthStore = defineStore('auth', () => {
	const currentUser = ref<User | null>(null);

	function loadFromStorage(): void {
		const saved = localStorage.getItem('chat_user');
		if (saved) {
			try {
				currentUser.value = JSON.parse(saved) as User;
			} catch {
				localStorage.removeItem('chat_user');
			}
		}
	}

	async function login(
		username: string,
		display_name: string,
	): Promise<void> {
		// Try to find existing user first, then create
		const results = await api.users.search(username);
		const existing = results.find((u) => u.username === username);
		if (existing) {
			currentUser.value = existing;
		} else {
			currentUser.value = await api.users.create(username, display_name);
		}
		localStorage.setItem('chat_user', JSON.stringify(currentUser.value));
	}

	function logout(): void {
		currentUser.value = null;
		localStorage.removeItem('chat_user');
	}

	return { currentUser, login, logout, loadFromStorage };
});
