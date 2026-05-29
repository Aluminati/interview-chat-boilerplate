import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types';
import { api } from '../api';

export const useUsersStore = defineStore('users', () => {
	const searchResults = ref<User[]>([]);
	const searching = ref(false);

	async function search(query: string): Promise<void> {
		if (!query.trim()) {
			searchResults.value = [];
			return;
		}
		searching.value = true;
		try {
			searchResults.value = await api.users.search(query);
		} finally {
			searching.value = false;
		}
	}

	function clearSearch(): void {
		searchResults.value = [];
	}

	return { searchResults, searching, search, clearSearch };
});
