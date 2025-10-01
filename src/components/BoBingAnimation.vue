<template>
	<div v-if="show" class="bb-anim" :class="{ celebrate: isHighRank }">
		<div class="overlay">
			<!-- 灯笼与月亮装饰 -->
			<div class="lantern l1">🏮</div>
			<div class="lantern l2">🏮</div>
			<div class="moon"></div>
			
			<!-- 烟花粒子（高等级更多更亮） -->
			<div class="sparks">
				<div v-for="n in sparkCount" :key="n" class="spark" :style="sparkStyle(n)"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
	show: { type: Boolean, default: false },
	rank: { type: String, default: '' },
	duration: { type: Number, default: 1200 }
});

const emit = defineEmits(['close']);

const temp = ref([1,2,3,4,5,6]);
const diceStyles = ref(['','','','','','']);
const isHighRank = ref(false);
const sparkCount = ref(24);
let raf = 0;
let startAt = 0;

function rand(min, max) { return Math.random() * (max - min) + min }
function styleFor() {
	const x = rand(-40, 40);
	const y = rand(-40, 40);
	const r = Math.floor(rand(0, 360));
	return `transform: translate(${x}%, ${y}%) rotate(${r}deg);`;
}

function tick(ts) {
	if (!startAt) startAt = ts;
	const elapsed = ts - startAt;
	// 更新数字与样式
	const next = Array.from({length:6}, () => 1 + Math.floor(Math.random()*6));
	temp.value = next;
	diceStyles.value = next.map(() => styleFor());
	if (elapsed < props.duration) {
		raf = requestAnimationFrame(tick);
	} else {
		cancelAnimationFrame(raf);
		raf = 0;
	}
}

watch(() => props.show, (val) => {
    if (val) {
        startAt = 0;
        isHighRank.value = checkHighRank(props.rank);
        sparkCount.value = isHighRank.value ? 48 : 24;
        raf = requestAnimationFrame(tick);
    } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
    }
});

onMounted(() => {
	if (props.show) raf = requestAnimationFrame(tick);
});
onUnmounted(() => { if (raf) cancelAnimationFrame(raf) });

function sparkStyle(i) {
	const a = (i / 20) * 360;
	const dist = 60 + (i % 5) * 6;
	const delay = (i % 10) * 0.08;
	return {
		transform: `rotate(${a}deg) translate(${dist}px)`,
		animationDelay: `${delay}s`
	};
}

function checkHighRank(r) {
    return ['状元插金花','六杯红','六杯黑','五王','状元'].some(n => r && r.includes(n));
}

function petalStyle(i) {
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 6;
    const delay = Math.random() * 2;
    const dx = (Math.random() * 140 - 70) + 'px';
    return {
        left: `${left}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        '--dx': dx
    };
}
</script>

<style scoped>
.bb-anim { position: fixed; inset: 0; z-index: 50; pointer-events: none; }
.bb-anim.celebrate .overlay { background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.25), rgba(0,0,0,0.6)); }
.overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.35), rgba(0,0,0,0.65)); display: grid; place-items: center; pointer-events: auto; }

.lantern { position: absolute; font-size: 44px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4)); animation: sway 2.2s ease-in-out infinite; transform-origin: top center; }
.l1 { top: 6%; left: 8%; animation-delay: .1s; }
.l2 { top: 10%; right: 8%; animation-delay: .5s; }
.moon { position: absolute; top: 4%; left: 50%; transform: translateX(-50%); width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff6c2, #ffd76a 55%, rgba(255,215,0,0.25) 70%, transparent 72%); box-shadow: 0 0 90px rgba(255,215,0,0.55); animation: pulse 1.8s ease-in-out infinite; }
.float-emojis { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.emoji { position: absolute; bottom: -20px; animation: rise 6s ease-in infinite, twirl 4s linear infinite; opacity: .9; }

.center { position: relative; width: min(520px, 90vw); height: min(520px, 90vw); display: grid; place-items: center; }
.mid-moon { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #fff6c2, #ffd76a 55%, rgba(255,215,0,0.15) 70%, transparent 72%); box-shadow: 0 0 50px rgba(255,215,0,0.35); animation: pulse 2s ease-in-out infinite; }
.dice-ring { position: absolute; width: 240px; height: 240px; border-radius: 50%; display: grid; grid-template-columns: repeat(3, 56px); gap: 8px; place-content: center; }
.d { width: 56px; height: 56px; background: #fff; color: #7a0000; border-radius: 10px; display: grid; place-items: center; font-weight: 800; box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
.rank { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: #ffd700; color: #7a0000; padding: 6px 12px; border-radius: 999px; font-weight: 800; box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
.close { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.45); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; }

.sparks { position: absolute; inset: 0; pointer-events: none; }
.spark { position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: #ffd700; border-radius: 50%; transform-origin: 0 0; animation: burst 1.2s ease-out infinite; box-shadow: 0 0 10px rgba(255,215,0,0.8), 0 0 18px rgba(255,0,0,0.35); }

@keyframes burst { 0% { opacity: 0; transform: scale(0.2); } 20% { opacity: 1; } 100% { opacity: 0; transform: scale(1); } }
@keyframes sway { 0%,100% { transform: translateY(0) rotate(-12deg) } 50% { transform: translateY(-14px) rotate(12deg) } }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
@keyframes rise { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(-110%); opacity: 0; } }
@keyframes twirl { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
</style>

