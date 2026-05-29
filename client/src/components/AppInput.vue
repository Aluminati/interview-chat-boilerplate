<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = defineProps<{
	modelValue: string;
	placeholder?: string;
	label?: string;
	id?: string;
	type?: string;
	error?: string;
	class?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const inputClass = twMerge(
	'block w-full rounded-md border border-gray-300 bg-white px-3 py-2',
	'text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500',
	'focus:outline-none focus:ring-1 focus:ring-indigo-500',
	props.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
	props.class,
);
</script>

<template>
	<div class="space-y-1">
		<label
			v-if="label"
			:for="id"
			class="block text-sm font-medium text-gray-800"
			>{{ label }}</label
		>
		<input
			:id="id"
			:type="type ?? 'text'"
			:value="modelValue"
			:placeholder="placeholder"
			:class="inputClass"
			@input="
				emit(
					'update:modelValue',
					($event.target as HTMLInputElement).value,
				)
			"
		/>
		<p v-if="error" class="text-xs text-red-600">{{ error }}</p>
	</div>
</template>
