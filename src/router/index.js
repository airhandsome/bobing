import { createRouter, createWebHashHistory } from 'vue-router';

const Home = () => import('../views/Home.vue');
const Game = () => import('../views/Game.vue');
const Knowledge = () => import('../views/Knowledge.vue');

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', name: 'home', component: Home },
		{ path: '/game', name: 'game', component: Game },
		{ path: '/knowledge', name: 'knowledge', component: Knowledge }
	]
});

export default router;

