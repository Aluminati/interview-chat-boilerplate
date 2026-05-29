import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import ChatView from '../views/ChatView.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/login', component: LoginView },
		{
			path: '/',
			component: ChatView,
			meta: { requiresAuth: true },
		},
	],
});

router.beforeEach((to) => {
	const auth = useAuthStore();
	if (to.meta.requiresAuth && !auth.currentUser) {
		return '/login';
	}
	if (to.path === '/login' && auth.currentUser) {
		return '/';
	}
});

export default router;
