<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
	<section class="hero">
		<div class="hero-content">
			<h1>中秋博饼 · 红红火火</h1>
			<p>呼朋唤友，一起摇骰子，感受传统的中秋民俗乐趣！</p>
			<div class="cta">
				<RouterLink class="btn primary" to="/game">开始博饼</RouterLink>
				<RouterLink class="btn" to="/knowledge">了解玩法</RouterLink>
			</div>
		</div>
		<div class="decor">
			<div class="moon" aria-hidden="true"></div>
			<div class="lantern l1"></div>
			<div class="lantern l2"></div>
			<img class="hero-img" src="/src/assets/bobing.png" alt="博饼装饰" />
		</div>
	</section>

	<section class="features">
		<div class="grid">
			<div class="card">
				<h3>传统民俗</h3>
				<p>博中秋、庆团圆，骰子声里是满满的喜气与祝福。</p>
			</div>
			<div class="card">
				<h3>多人同乐</h3>
				<p>支持多人回合制，记录每轮结果与称号。</p>
			</div>
			<div class="card">
				<h3>移动优先</h3>
				<p>响应式设计，手机也能畅玩。</p>
			</div>
		</div>
	</section>
</template>

<style scoped>
.hero {
	position: relative;
	border-radius: 16px;
	padding: 28px;
	background: linear-gradient(180deg, #a80000, #d10000);
	color: #fff;
	overflow: hidden;
}
.hero-content { position: relative; z-index: 1; max-width: 640px; }
.cta { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
.btn { background: rgba(255,255,255,0.15); color: #fff; padding: 10px 14px; border-radius: 10px; text-decoration: none; backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.25); }
.btn.primary { background: #ffd700; color: #7a0000; }
.decor .moon { position: absolute; right: -40px; top: -40px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff6c2, #ffd76a 50%, rgba(255,215,0,0.1) 70%, transparent 72%); box-shadow: 0 0 60px rgba(255,215,0,0.5); }
.lantern { position: absolute; width: 28px; height: 36px; background: linear-gradient(#ff4444, #b30000); border: 2px solid rgba(0,0,0,0.15); border-radius: 14px; box-shadow: 0 8px 18px rgba(0,0,0,0.28); animation: swing 3s ease-in-out infinite; }
.lantern::after { content: ""; position: absolute; bottom: -10px; left: 50%; width: 2px; height: 10px; background: gold; transform: translateX(-50%); }
.l1 { right: 120px; top: 40px; animation-delay: .2s; }
.l2 { right: 70px; top: 120px; animation-delay: .6s; }
@keyframes swing { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }

.hero-img { position: absolute; right: 16px; bottom: -6px; width: min(40%, 320px); max-width: 45vw; height: auto; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3)); pointer-events: none; }
@media (max-width: 768px) {
	.hero-img { right: 8px; bottom: -4px; width: 44vw; }
}

.features { margin-top: 24px; }
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(3, 1fr); } }
.card { background: #fff; color: #7a0000; border-radius: 12px; padding: 16px; border: 1px solid #ffd3d3; box-shadow: 0 4px 14px rgba(218,0,0,0.08); }
</style>

