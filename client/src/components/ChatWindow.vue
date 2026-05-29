<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatsStore } from '../stores/chats';
import MessageBubble from './MessageBubble.vue';
import AppButton from './AppButton.vue';

const authStore = useAuthStore();
const chatsStore = useChatsStore();

const newMessage = ref('');
const sending = ref(false);
const sendError = ref('');
const messagesEl = ref<HTMLElement | null>(null);

async function send(): Promise<void> {
	const content = newMessage.value.trim();
	if (!content || !authStore.currentUser) return;
	sending.value = true;
	sendError.value = '';
	try {
		await chatsStore.sendMessage(authStore.currentUser.id, content);
		newMessage.value = '';
		scrollToBottom();
	} catch (e) {
		sendError.value = e instanceof Error ? e.message : 'Failed to send';
	} finally {
		sending.value = false;
	}
}

function scrollToBottom(): void {
	nextTick(() => {
		if (messagesEl.value) {
			messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
		}
	});
}

watch(
	() => chatsStore.messages.length,
	() => scrollToBottom(),
);

watch(
	() => chatsStore.activeChat,
	() => scrollToBottom(),
);
</script>

<template>
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<div
			v-if="chatsStore.activeChat"
			class="flex items-center border-b border-gray-200 bg-white px-6 py-4"
		>
			<div>
				<h1 class="text-base font-semibold text-gray-900">
					{{ chatsStore.activeChat.name }}
				</h1>
				<p class="text-xs text-gray-500">
					{{
						chatsStore.activeChat.participant_usernames
							.split(',')
							.join(', ')
					}}
				</p>
			</div>
		</div>

		<!-- Empty state -->
		<div
			v-if="!chatsStore.activeChat"
			class="flex flex-1 items-center justify-center text-gray-400"
		>
			<p>Select a chat or start a new one.</p>
		</div>

		<template v-else>
			<!-- Messages -->
			<div
				ref="messagesEl"
				class="flex-1 overflow-y-auto space-y-3 p-4"
				aria-live="polite"
				aria-label="Messages"
			>
				<MessageBubble
					v-for="msg in chatsStore.messages"
					:key="msg.id"
					:message="msg"
				/>
				<p
					v-if="!chatsStore.messages.length"
					class="text-center text-sm text-gray-400"
				>
					No messages yet. Say hello!
				</p>
			</div>

			<!-- Input -->
			<div class="border-t border-gray-200 bg-white px-4 py-3">
				<p
					v-if="sendError"
					class="mb-1 text-xs text-red-600"
					role="alert"
				>
					{{ sendError }}
				</p>
				<form class="flex gap-2" @submit.prevent="send">
					<input
						v-model="newMessage"
						class="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						placeholder="Type a message…"
						:disabled="sending"
						aria-label="Message input"
					/>
					<AppButton
						type="submit"
						:disabled="sending || !newMessage.trim()"
					>
						Send
					</AppButton>
				</form>
			</div>
		</template>
	</div>
</template>
