<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppButton from '../components/AppButton.vue';
import AppInput from '../components/AppInput.vue';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const displayName = ref('');
const loading = ref(false);
const error = ref('');

const usernameError = ref('');
const displayNameError = ref('');

function validate(): boolean {
	usernameError.value = '';
	displayNameError.value = '';
	let ok = true;
	if (!/^[a-zA-Z0-9_]{2,32}$/.test(username.value)) {
		usernameError.value =
			'2–32 characters, letters/numbers/underscores only.';
		ok = false;
	}
	if (
		displayName.value.trim().length < 2 ||
		displayName.value.trim().length > 64
	) {
		displayNameError.value = '2–64 characters required.';
		ok = false;
	}
	return ok;
}

async function submit(): Promise<void> {
	if (!validate()) return;
	loading.value = true;
	error.value = '';
	try {
		await authStore.login(username.value, displayName.value.trim());
		router.push('/');
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Login failed';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
		<div class="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">
				Sign in to Chat
			</h1>

			<form class="space-y-4" @submit.prevent="submit">
				<AppInput
					v-model="username"
					id="username"
					label="Username"
					placeholder="your_username"
					:error="usernameError"
				/>
				<AppInput
					v-model="displayName"
					id="display-name"
					label="Display name"
					placeholder="Your Name"
					:error="displayNameError"
				/>

				<p v-if="error" class="text-sm text-red-600" role="alert">
					{{ error }}
				</p>

				<AppButton type="submit" :disabled="loading" class="w-full">
					{{ loading ? 'Signing in…' : 'Sign in' }}
				</AppButton>
			</form>

			<p class="mt-4 text-xs text-gray-500">
				Existing username? We'll sign you in. New? We'll create your
				account.
			</p>
		</div>
	</div>
</template>
