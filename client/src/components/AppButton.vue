<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
	defineProps<{
		variant?: 'primary' | 'secondary' | 'ghost';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
	}>(),
	{ variant: 'primary', disabled: false, type: 'button' },
);

const base =
	'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<string, string> = {
	primary:
		'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
	secondary:
		'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
	ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
};

const classes = twMerge(base, variants[props.variant], props.class);
</script>

<template>
	<button :type="type" :disabled="disabled" :class="classes">
		<slot />
	</button>
</template>
