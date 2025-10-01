<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
	<div class="app-shell">
		<NavBar />
		<main class="container">
			<router-view />
		</main>
		<footer class="site-footer">中秋博饼 · 团圆共乐</footer>
	</div>
</template>

<style scoped>
.app-shell {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background:
		radial-gradient(1200px 600px at 110% -10%, rgba(255, 215, 0, 0.15), transparent 60%),
		radial-gradient(800px 400px at -10% 10%, rgba(255, 0, 0, 0.12), transparent 60%);
}
.container {
	flex: 1;
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	padding: 16px;
}
.site-footer {
	text-align: center;
	padding: 16px 0;
	opacity: 0.9;
}
@media (min-width: 768px) {
	.container { padding: 24px; }
}
</style>
