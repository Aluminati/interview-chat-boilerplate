<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatsStore } from '../stores/chats';
import type { User } from '../types';
import AppButton from './AppButton.vue';
import AppInput from './AppInput.vue';
import UserSearch from './UserSearch.vue';

const emit = defineEmits<{
	close: [];
	created: [];
}>();

const authStore = useAuthStore();
const chatsStore = useChatsStore();

const chatName = ref('');
const participants = ref<User[]>([]);
const submitting = ref(false);
const formError = ref('');

const excludeIds = computed(() => {
	const ids = participants.value.map((u) => u.id);
	if (authStore.currentUser) ids.push(authStore.currentUser.id);
	return ids;
});

import { computed } from 'vue';

function addParticipant(user: User): void {
	if (!participants.value.find((p) => p.id === user.id)) {
		participants.value = [...participants.value, user];
	}
}

function removeParticipant(id: number): void {
	participants.value = participants.value.filter((p) => p.id !== id);
}

async function submit(): Promise<void> {
	formError.value = '';
	if (participants.value.length < 1) {
		formError.value = 'Add at least one other participant.';
		return;
	}
	submitting.value = true;
	try {
		const ids = [
			authStore.currentUser!.id,
			...participants.value.map((u) => u.id),
		];
		const name = chatName.value.trim() || undefined;
		const chat = await chatsStore.createChat(name, ids);
		await chatsStore.selectChat(chat);
		emit('created');
		emit('close');
	} catch (e) {
		formError.value =
			e instanceof Error ? e.message : 'Failed to create chat';
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	>
		<div class="w-full max-w-md rounded-lg bg-white shadow-xl">
			<div
				class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
			>
				<h2 class="text-lg font-semibold text-gray-900">New Chat</h2>
				<button
					class="text-gray-400 hover:text-gray-600"
					aria-label="Close"
					@click="emit('close')"
				>
					✕
				</button>
			</div>

			<form class="space-y-4 p-6" @submit.prevent="submit">
				<UserSearch
					:exclude-ids="excludeIds"
					label="Add participants"
					@select="addParticipant"
				/>

				<AppInput
					v-model="chatName"
					id="chat-name"
					label="Chat name (optional)"
					placeholder="Enter a name for this chat…"
				/>

				<div v-if="participants.length" class="flex flex-wrap gap-2">
					<span
						v-for="p in participants"
						:key="p.id"
						class="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
					>
						{{ p.display_name }}
						<button
							type="button"
							class="ml-1 text-indigo-500 hover:text-indigo-700"
							:aria-label="`Remove ${p.display_name}`"
							@click="removeParticipant(p.id)"
						>
							✕
						</button>
					</span>
				</div>

				<p v-if="formError" class="text-sm text-red-600" role="alert">
					{{ formError }}
				</p>

				<div class="flex justify-end gap-2 pt-2">
					<AppButton
						variant="secondary"
						type="button"
						@click="emit('close')"
						>Cancel</AppButton
					>
					<AppButton type="submit" :disabled="submitting">
						{{ submitting ? 'Creating…' : 'Create Chat' }}
					</AppButton>
				</div>
			</form>
		</div>
	</div>
</template>
