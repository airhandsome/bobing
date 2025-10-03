import { createRouter, createWebHashHistory } from 'vue-router';

const Home = () => import('../views/Home.vue');
const Game = () => import('../views/Game.vue');
const Knowledge = () => import('../views/Knowledge.vue');
const Avatar = () => import('../views/Avatar.vue');
const Card = () => import('../views/Card.vue');
const CardPro = () => import('../views/CardPro.vue');

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', name: 'home', component: Home },
		{ path: '/game', name: 'game', component: Game },
		{ path: '/knowledge', name: 'knowledge', component: Knowledge },
		{ path: '/avatar', name: 'avatar', component: Avatar }
		, { path: '/card', name: 'card', component: Card }
		, { path: '/card-pro', name: 'card-pro', component: CardPro }
	]
});

export default router;

