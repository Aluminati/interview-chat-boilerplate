<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUsersStore } from '../stores/users';
import type { User } from '../types';
import AppInput from './AppInput.vue';

const props = defineProps<{
	excludeIds?: number[];
	label?: string;
}>();

const emit = defineEmits<{
	select: [user: User];
}>();

const usersStore = useUsersStore();
const query = ref('');

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, (q) => {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => usersStore.search(q), 300);
});

function select(user: User): void {
	emit('select', user);
	query.value = '';
	usersStore.clearSearch();
}

const filteredResults = computed(() =>
	usersStore.searchResults.filter((u) => !props.excludeIds?.includes(u.id)),
);

import { computed } from 'vue';
</script>

<template>
	<div class="relative">
		<AppInput
			v-model="query"
			:label="label ?? 'Find a user'"
			placeholder="Search by username or name…"
		/>
		<ul
			v-if="filteredResults.length"
			class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
			role="listbox"
		>
			<li
				v-for="user in filteredResults"
				:key="user.id"
				class="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-indigo-50 focus:bg-indigo-50"
				role="option"
				tabindex="0"
				@click="select(user)"
				@keydown.enter="select(user)"
			>
				<span class="font-medium text-gray-900">{{
					user.display_name
				}}</span>
				<span class="text-xs text-gray-500">@{{ user.username }}</span>
			</li>
		</ul>
		<p
			v-else-if="query && !usersStore.searching"
			class="mt-1 text-xs text-gray-500"
		>
			No users found.
		</p>
	</div>
</template>
