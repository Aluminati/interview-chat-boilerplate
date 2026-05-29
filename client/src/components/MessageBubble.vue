<script setup lang="ts">
import type { Message } from '../types';
import { useAuthStore } from '../stores/auth';
import { twMerge } from 'tailwind-merge';

const props = defineProps<{ message: Message }>();
const authStore = useAuthStore();

const isMine = computed(
	() => authStore.currentUser?.id === props.message.sender_id,
);

import { computed } from 'vue';

function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
}
</script>

<template>
	<div
		:class="twMerge('flex flex-col', isMine ? 'items-end' : 'items-start')"
	>
		<span v-if="!isMine" class="mb-0.5 text-xs font-medium text-gray-600">
			{{ message.sender_display_name }}
		</span>
		<div
			:class="
				twMerge(
					'max-w-xs rounded-2xl px-4 py-2 text-sm lg:max-w-md',
					isMine
						? 'rounded-br-sm bg-indigo-600 text-white'
						: 'rounded-bl-sm bg-gray-100 text-gray-900',
				)
			"
		>
			{{ message.content }}
		</div>
		<span class="mt-0.5 text-xs text-gray-400">{{
			formatTime(message.sent_at)
		}}</span>
	</div>
</template>
