<script setup lang="ts">
import { ref } from 'vue';
import ChatSidebar from '../components/ChatSidebar.vue';
import ChatWindow from '../components/ChatWindow.vue';
import NewChatModal from '../components/NewChatModal.vue';
import { useAuthStore } from '../stores/auth';
import { useChatsStore } from '../stores/chats';

const authStore = useAuthStore();
const chatsStore = useChatsStore();
const showNewChat = ref(false);

function onChatCreated(): void {
	if (authStore.currentUser) {
		chatsStore.fetchChats(authStore.currentUser.id);
	}
}
</script>

<template>
	<div class="flex h-screen overflow-hidden bg-gray-50">
		<ChatSidebar @new-chat="showNewChat = true" />
		<main class="flex flex-1 flex-col overflow-hidden">
			<ChatWindow />
		</main>

		<NewChatModal
			v-if="showNewChat"
			@close="showNewChat = false"
			@created="onChatCreated"
		/>
	</div>
</template>
