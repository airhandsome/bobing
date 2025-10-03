<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const mobileOpen = ref(false);
function toggleMenu() { mobileOpen.value = !mobileOpen.value }
</script>

<template>
	<header class="nav">
		<div class="nav-inner">
			<div class="brand">
				<span class="brand-emoji">🏮</span>
				<span class="brand-text">中秋博饼</span>
			</div>
			<nav class="links" :class="{ open: mobileOpen }">
				<RouterLink to="/">首页</RouterLink>
				<RouterLink to="/game">开始博饼</RouterLink>
				<RouterLink to="/knowledge">什么是博饼</RouterLink>
				<RouterLink to="/avatar">头像定制</RouterLink>
				<!-- <RouterLink to="/card">中秋贺卡</RouterLink> -->
				<RouterLink to="/card-pro">贺卡（专业版）</RouterLink>
			</nav>
			<button class="menu" @click="toggleMenu" aria-label="切换菜单">☰</button>
		</div>
	</header>
</template>

<style scoped>
.nav {
	position: sticky;
	top: 0;
	z-index: 10;
	background: linear-gradient(90deg, #b30000, #d10000);
	color: #fff;
	box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.nav-inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
}
.brand { display: flex; align-items: center; gap: 8px; font-weight: 700; }
.brand-emoji { filter: drop-shadow(0 0 6px rgba(255,215,0,0.6)); }
.links { display: none; gap: 16px; }
.links a { color: #fff; text-decoration: none; padding: 8px 10px; border-radius: 8px; }
.links a.router-link-active { background: rgba(255,255,255,0.18); }
.menu { display: inline-flex; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.35); padding: 6px 10px; border-radius: 8px; }

@media (min-width: 768px) {
	.links { display: flex; }
	.menu { display: none; }
}

.links.open { display: flex; flex-direction: column; position: absolute; top: 56px; right: 12px; background: #b30000; padding: 12px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
</style>

