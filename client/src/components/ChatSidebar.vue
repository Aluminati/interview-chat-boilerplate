<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatsStore } from '../stores/chats';
import type { Chat } from '../types';
import AppButton from './AppButton.vue';

const emit = defineEmits<{
	newChat: [];
}>();

const authStore = useAuthStore();
const chatsStore = useChatsStore();

onMounted(() => {
	if (authStore.currentUser) {
		chatsStore.fetchChats(authStore.currentUser.id);
	}
});

function selectChat(chat: Chat): void {
	chatsStore.selectChat(chat);
}

function participantNames(chat: Chat): string {
	const all = chat.participant_usernames.split(',');
	const others = all.filter((u) => u !== authStore.currentUser?.username);
	return others.join(', ');
}
</script>

<template>
	<aside
		class="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white"
	>
		<div
			class="flex items-center justify-between border-b border-gray-200 px-4 py-3"
		>
			<span class="font-semibold text-gray-900">Chats</span>
			<AppButton
				variant="ghost"
				class="px-2 py-1 text-xs"
				@click="emit('newChat')"
			>
				+ New
			</AppButton>
		</div>

		<div v-if="chatsStore.loading" class="p-4 text-sm text-gray-500">
			Loading…
		</div>
		<div
			v-else-if="!chatsStore.chats.length"
			class="p-4 text-sm text-gray-500"
		>
			No chats yet. Start one!
		</div>

		<nav class="flex-1 overflow-y-auto" aria-label="Chat list">
			<button
				v-for="chat in chatsStore.chats"
				:key="chat.id"
				:aria-current="
					chatsStore.activeChat?.id === chat.id ? 'page' : undefined
				"
				:class="[
					'flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-gray-50',
					chatsStore.activeChat?.id === chat.id
						? 'bg-indigo-50 border-l-4 border-indigo-500'
						: '',
				]"
				@click="selectChat(chat)"
			>
				<span
					class="text-sm font-medium text-gray-900 truncate w-full"
					>{{ chat.name }}</span
				>
				<span class="text-xs text-gray-500 truncate w-full">{{
					participantNames(chat)
				}}</span>
			</button>
		</nav>

		<div class="border-t border-gray-200 px-4 py-3">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-900">
						{{ authStore.currentUser?.display_name }}
					</p>
					<p class="text-xs text-gray-500">
						@{{ authStore.currentUser?.username }}
					</p>
				</div>
				<AppButton
					variant="ghost"
					class="px-2 py-1 text-xs"
					@click="authStore.logout()"
				>
					Sign out
				</AppButton>
			</div>
		</div>
	</aside>
</template>
