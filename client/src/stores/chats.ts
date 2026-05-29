import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Chat, Message } from '../types';
import { api } from '../api';

export const useChatsStore = defineStore('chats', () => {
	const chats = ref<Chat[]>([]);
	const activeChat = ref<Chat | null>(null);
	const messages = ref<Message[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetchChats(userId: number): Promise<void> {
		loading.value = true;
		error.value = null;
		try {
			chats.value = await api.chats.list(userId);
		} catch (e) {
			error.value =
				e instanceof Error ? e.message : 'Failed to load chats';
		} finally {
			loading.value = false;
		}
	}

	async function selectChat(chat: Chat): Promise<void> {
		activeChat.value = chat;
		messages.value = [];
		await fetchMessages(chat.id);
	}

	async function fetchMessages(
		chatId: number,
		since?: string,
	): Promise<Message[]> {
		const newMessages = await api.chats.messages(chatId, since);
		if (since) {
			messages.value = [...messages.value, ...newMessages];
		} else {
			messages.value = newMessages;
		}
		return newMessages;
	}

	async function sendMessage(
		senderId: number,
		content: string,
	): Promise<void> {
		if (!activeChat.value) return;
		const msg = await api.chats.sendMessage(
			activeChat.value.id,
			senderId,
			content,
		);
		messages.value = [...messages.value, msg];
	}

	async function createChat(
		name: string | undefined,
		participantIds: number[],
	): Promise<Chat> {
		const chat = await api.chats.create(name, participantIds);
		chats.value = [chat, ...chats.value];
		return chat;
	}

	return {
		chats,
		activeChat,
		messages,
		loading,
		error,
		fetchChats,
		selectChat,
		fetchMessages,
		sendMessage,
		createChat,
	};
});
