<script setup>
import { ref, computed, onMounted } from 'vue';
import { rollDice, judgeRank, rankWeight, RANKS } from '../utils/bobing.js';
import BoBingAnimation from '../components/BoBingAnimation.vue';

const players = ref(['玩家一', '玩家二']);
const editingIndex = ref(-1);
const newPlayerName = ref('');
const currentIndex = ref(0);
const lastRoll = ref([]);
const lastRank = ref('');
const history = ref([]);
const isRolling = ref(false);
const tempRoll = ref([1,2,3,4,5,6]);
let rollTimer = null;
const showBowlImg = ref(true);
const motionStyles = ref(['','','','','','']);
let dropAudio = null;
let shakeAudio = null;
const showAnim = ref(false);

const RULES_SAMPLES = [
	{ name: RANKS.ZJ_IN_FLOWER, sample: [4,4,4,4,1,1] },
	{ name: RANKS.SIX_RED, sample: [4,4,4,4,4,4] },
	{ name: RANKS.FIVE_KIND, sample: [2,2,2,2,2,5] },
	{ name: RANKS.ZHUANGYUAN, sample: [4,4,4,4,2,5] },
	{ name: RANKS.FOUR_KIND, sample: [6,6,6,6,3,1] },
	{ name: RANKS.STRAIGHT, sample: [1,2,3,4,5,6] },
	{ name: RANKS.THREE_RED, sample: [4,4,4,2,3,6] },
	{ name: RANKS.TWO_RED, sample: [4,4,1,2,3,6] },
	{ name: RANKS.ONE_RED, sample: [4,1,2,3,5,6] },
	{ name: RANKS.NONE, sample: [1,1,2,2,3,5] }
];

function addPlayer() {
	const name = newPlayerName.value.trim();
	players.value.push(name || `玩家${players.value.length + 1}`);
	newPlayerName.value = '';
}

function startEdit(i) {
	editingIndex.value = i;
}

function finishEdit(i, e) {
	const val = (e?.target?.value ?? '').trim();
	if (val) {
		const oldName = players.value[i];
		players.value[i] = val;
		// 更新历史中旧名字为新名字，并持久化
		history.value = history.value.map(h => h.player === oldName ? { ...h, player: val } : h);
		localStorage.setItem(LS_KEY, JSON.stringify(history.value));
	}
	editingIndex.value = -1;
}

function removePlayer(i) {
	if (players.value.length > 1) players.value.splice(i, 1);
	if (currentIndex.value >= players.value.length) currentIndex.value = 0;
}

function animateRoll(finalDice) {
	isRolling.value = true;
	let frames = 0;
	const start = performance.now();
	const duration = 900; // ms
    showAnim.value = true;
	const animate = (t) => {
		const elapsed = t - start;
		// 所有六枚骰子同时运动：更新每个骰子的样式与临时点数
		const next = rollDice();
		tempRoll.value = next;
		motionStyles.value = next.map((_, idx) => randomDiceStyle(idx));
		frames++;
		if (elapsed < duration) {
			rollTimer = requestAnimationFrame(animate);
		} else {
			lastRoll.value = finalDice;
			lastRank.value = judgeRank(finalDice);
			saveHistory({
				id: Date.now(),
				player: players.value[currentIndex.value],
				dice: lastRoll.value,
				rank: lastRank.value,
				weight: rankWeight(lastRank.value)
			});
			currentIndex.value = (currentIndex.value + 1) % players.value.length;
			isRolling.value = false;
			motionStyles.value = ['','','','','',''];
			try { dropAudio && dropAudio.play(); } catch {}
            setTimeout(() => { showAnim.value = false; }, 700);
		}
	};
	rollTimer = requestAnimationFrame(animate);
}

function roll() {
	if (isRolling.value) return;
	const dice = rollDice();
	try { if (shakeAudio) { shakeAudio.currentTime = 0; shakeAudio.play(); } } catch {}
	animateRoll(dice);
}

const leader = computed(() => {
	if (!history.value.length) return '';
	return history.value.slice().sort((a,b) => a.weight - b.weight)[0].player;
});

const LS_KEY = 'bobing_history';
function saveHistory(entry) {
	history.value.unshift(entry);
	localStorage.setItem(LS_KEY, JSON.stringify(history.value));
}
function loadHistory() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (raw) history.value = JSON.parse(raw) || [];
	} catch {}
}
function clearHistory() {
	history.value = [];
	localStorage.removeItem(LS_KEY);
}

onMounted(() => {
	loadHistory();
	try {
		dropAudio = new Audio('/src/assets/drop.mp3');
		dropAudio.volume = 0.5;
		shakeAudio = new Audio('/src/assets/shake.mp3');
		shakeAudio.volume = 0.45;
	} catch {}
});

// 生成随机的骰子动画样式（位置与旋转），让其在碗内弹跳
function randomDiceStyle(idx) {
	const x = Math.random() * 26 - 13; // center cluster within dice-layer
	const y = Math.random() * 26 - 13;
	const r = Math.floor(Math.random() * 360);
	return `transform: translate(${x}%, ${y}%) rotate(${r}deg);`;
}
</script>

<template>
	<section class="game">
		<h2>开始博饼</h2>
		<div class="layout">
			<div class="left">
				<h3>玩家</h3>
				<ul class="players">
					<li v-for="(p,i) in players" :key="p" :class="{ active: i===currentIndex }">
						<span v-if="editingIndex!==i" @dblclick="startEdit(i)">{{ p }}</span>
						<input v-else type="text" :value="p" @blur="(e)=>finishEdit(i,e)" @keyup.enter="(e)=>finishEdit(i,e)" class="name-input" />
						<button class="link" @click="startEdit(i)">改名</button>
						<button class="link" @click="removePlayer(i)" v-if="players.length>1">移除</button>
					</li>
				</ul>
				<div class="add">
					<input class="name-input" v-model="newPlayerName" placeholder="输入玩家名（可空）" />
					<button class="btn" @click="addPlayer">添加玩家</button>
				</div>
				<div class="now">当前：<b>{{ players[currentIndex] }}</b></div>
				<div class="leader" v-if="leader">领先者：<b>{{ leader }}</b></div>
			</div>
			<div class="center">
				<div class="bowl" :class="{ shaking: isRolling }">
					<img v-if="showBowlImg" class="bowl-img" src="/src/assets/bowl.png" alt="bowl" @error="showBowlImg=false" />
					<div class="dice-layer">
						<div
							class="dice"
							v-for="(d,di) in (isRolling ? tempRoll : lastRoll)"
							:key="di"
							:style="isRolling ? motionStyles[di] : ''"
						>{{ d }}</div>
					</div>
				</div>
				<BoBingAnimation :show="showAnim" :rank="lastRank" @close="showAnim=false" />
				<div class="rank" v-if="lastRank && !isRolling">结果：<b>{{ lastRank }}</b></div>
				<button class="btn primary" :disabled="isRolling" @click="roll">{{ isRolling ? '摇骰中…' : '摇一摇' }}</button>
				<p class="hint">使用 6 枚骰子，自动判定称号</p>
				<button class="btn" @click="clearHistory">清空历史</button>
			</div>
			<div class="right">
				<h3>历史记录</h3>
				<ul class="history">
					<li v-for="h in history" :key="h.id">
						<div>
							<b>{{ h.player }}</b>
							<span class="muted">（{{ h.dice.join(', ') }}）</span>
						</div>
						<div class="badge">{{ h.rank }}</div>
					</li>
				</ul>
			</div>
		</div>
			<div class="rules">
			<h3>判定规则（由高到低）</h3>
			<div class="rules-image">
					<img src="/src/assets/rule.png" alt="判定规则" />
			</div>
				<div class="rules-text">
					<ol>
						<li>状元插金花：4×4 + 1×2</li>
						<li>六杯红：4×6</li>
						<li>六杯黑：2×6</li>
						<li>五王：4×5</li>
						<li>五子带一秀：2×5 + 4×1</li>
						<li>五子登科：2×5</li>
						<li>状元：4×4</li>
						<li>榜眼（对堂）：1,2,3,4,5,6</li>
						<li>探花（三红）：4×3</li>
						<li>进士（四进）：任意点数×4</li>
						<li>举人（二举）：4×2</li>
						<li>秀才（一秀）：4×1</li>
					</ol>
				</div>
		</div>
	</section>
</template>

<style scoped>
.game { background: #fff; border-radius: 12px; border: 1px solid #ffd3d3; padding: 16px; color: #7a0000; }
.layout { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 960px) { .layout { grid-template-columns: 260px 1fr 360px; } }

.players { list-style: none; padding: 0; margin: 0 0 12px 0; display: flex; gap: 8px; flex-wrap: wrap; }
.players li { background: #fff5f5; border: 1px solid #ffbcbc; color: #7a0000; padding: 6px 10px; border-radius: 10px; display: flex; align-items: center; gap: 8px; }
.players li.active { outline: 2px solid #ffd700; }
.link { background: transparent; border: none; color: #b30000; cursor: pointer; }
.add { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.name-input { padding: 6px 8px; border-radius: 8px; border: 1px solid #ffbcbc; background: #fff; color: #7a0000; }

.bowl { position: relative; height: 580px; background: radial-gradient(ellipse at 50% 40%, #ffe0e0, #ffb3b3); padding: 18px; box-shadow: inset 0 12px 36px rgba(179,0,0,0.22); margin-bottom: 10px; overflow: hidden; }
.bowl-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .9; pointer-events: none; }
.bowl.shaking { animation: shake 0.6s linear infinite; }
.dice-layer { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: grid; grid-template-columns: repeat(3, 56px); gap: 8px; }
.dice { width: 56px; height: 56px; background: #fff; color: #7a0000; display: grid; place-items: center; border-radius: 10px; font-weight: 700; font-size: 20px; box-shadow: 0 6px 14px rgba(0,0,0,0.15); position: relative; }
.dice.small { width: 28px; height: 28px; font-size: 14px; border-radius: 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.12); }
.rules-list { list-style: none; padding: 0; margin: 8px 0 0 0; display: grid; gap: 10px; }
.rule-item { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rule-name { min-width: 9em; }
.sample { display: flex; gap: 6px; }
.rank { margin-bottom: 8px; }
.hint { opacity: 0.8; }

.history { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.history li { display: flex; align-items: center; justify-content: space-between; background: #fff5f5; border: 1px solid #ffbcbc; border-radius: 10px; padding: 8px 10px; }
.badge { background: #ffd700; color: #7a0000; padding: 4px 8px; border-radius: 999px; font-weight: 700; }

.btn { background: rgba(179,0,0,0.08); color: #7a0000; padding: 10px 14px; border-radius: 10px; text-decoration: none; border: 1px solid #ffbcbc; }
.btn.primary { background: #ffd700; color: #7a0000; border: none; }

.rules { margin-top: 16px; background: #fff; border: 1px solid #ffd3d3; border-radius: 12px; padding: 12px 16px; }
.rules-image img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
.rules-text ol { padding-left: 18px; margin: 10px 0 0 0; }
.rules ol { padding-left: 18px; }
.muted { opacity: .75; }

@keyframes shake {
	0%,100% { transform: translateY(0) }
	20% { transform: translateY(-3px) }
	40% { transform: translateY(2px) }
	60% { transform: translateY(-2px) }
	80% { transform: translateY(3px) }
}
</style>

