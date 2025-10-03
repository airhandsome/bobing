<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

const canvasRef = ref(null);
const ctxRef = ref(null);
const W = 900; // 导出较高清
const H = 1200;

const state = reactive({
	template: 'mid-autumn', // mid-autumn | festive-red | minimal
	bgFileUrl: '',
	bgImg: null,
	title: '中秋快乐',
	subtitle: '阖家团圆 · 月圆人圆',
	showStickers: true,
	moonGlow: true,
	lanterns: true,
	petals: true,
	qrText: 'bobing.fvision.top'
});

function onUpload(e) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	const url = URL.createObjectURL(file);
	state.bgFileUrl = url;
	const img = new Image();
	img.onload = () => { state.bgImg = img; draw(); };
	img.src = url;
}

function getCtx() {
	const canvas = canvasRef.value; if (!canvas) return null;
	if (!ctxRef.value) ctxRef.value = canvas.getContext('2d');
	return ctxRef.value;
}

function drawBackground(ctx) {
	if (state.template === 'mid-autumn') {
		const grad = ctx.createLinearGradient(0,0,0,H);
		grad.addColorStop(0,'#7a0000');
		grad.addColorStop(1,'#d10000');
		ctx.fillStyle = grad;
		ctx.fillRect(0,0,W,H);
		if (state.moonGlow) {
			const cx = W*0.78, cy = H*0.18, r = 140;
			const rg = ctx.createRadialGradient(cx-20,cy-20, r*0.2, cx, cy, r);
			rg.addColorStop(0,'#fff9cc');
			rg.addColorStop(0.5,'#ffd76a');
			rg.addColorStop(1,'rgba(255,215,0,0)');
			ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
		}
	} else if (state.template === 'festive-red') {
		const grad = ctx.createLinearGradient(0,0,W,0);
		grad.addColorStop(0,'#8b0000'); grad.addColorStop(1,'#ff3030');
		ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);
	} else {
		ctx.fillStyle = '#faf7ef'; ctx.fillRect(0,0,W,H);
	}

	if (state.bgImg) {
		const img = state.bgImg; const rw = W; const rh = Math.floor(W * (img.height/img.width));
		const y = Math.floor((H - rh)/2);
		ctx.globalAlpha = 0.9; ctx.drawImage(img, 0, y, rw, rh); ctx.globalAlpha = 1;
	}
}

function drawDecor(ctx) {
	ctx.save();
	ctx.font = '64px system-ui';
	ctx.fillStyle = '#ffd700';
	ctx.textAlign = 'center';
	ctx.fillText(state.title || '', W/2, H*0.18);
	ctx.font = '28px system-ui';
	ctx.fillStyle = '#fff';
	ctx.fillText(state.subtitle || '', W/2, H*0.22);

	if (state.showStickers) {
		if (state.lanterns) {
			ctx.font = '56px system-ui';
			ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
			ctx.fillText('🏮', W*0.12, H*0.12);
			ctx.fillText('🏮', W*0.86, H*0.18);
		}
		if (state.petals) {
			ctx.shadowColor = 'transparent';
			ctx.font = '24px system-ui';
			for (let i=0;i<50;i++) {
				const x = Math.random()*W, y = Math.random()*H;
				ctx.globalAlpha = 0.3 + Math.random()*0.4;
				ctx.fillText('🌼', x, y);
			}
			ctx.globalAlpha = 1;
		}
	}
	ctx.restore();
}

function drawQr(ctx) {
	ctx.save();
	ctx.fillStyle = 'rgba(255,255,255,.85)';
	ctx.fillRect(24,H-92, 260, 68);
	ctx.fillStyle = '#7a0000';
	ctx.font = 'bold 20px system-ui';
	ctx.fillText(state.qrText || '', 44, H-48);
	ctx.restore();
}

function draw() {
	const ctx = getCtx(); if (!ctx) return;
	ctx.clearRect(0,0,W,H);
	drawBackground(ctx);
	drawDecor(ctx);
	drawQr(ctx);
}

function download() {
	const canvas = canvasRef.value; if (!canvas) return;
	const link = document.createElement('a');
	link.download = 'moon-card.png';
	link.href = canvas.toDataURL('image/png');
	link.click();
}

watch(() => [state.template, state.title, state.subtitle, state.showStickers, state.moonGlow, state.lanterns, state.petals, state.qrText], draw, { deep: true });
onMounted(draw);
</script>

<template>
	<section class="card">
		<h2>中秋贺卡生成</h2>
		<div class="grid">
			<div class="left">
				<canvas ref="canvasRef" :width="W" :height="H" class="canvas"></canvas>
			</div>
			<div class="right">
				<label class="row">
					<span>模板</span>
					<select v-model="state.template">
						<option value="mid-autumn">中秋 · 红金</option>
						<option value="festive-red">喜庆 · 大红</option>
						<option value="minimal">简约 · 米白</option>
					</select>
				</label>
				<label class="row">
					<span>上传背景</span>
					<input type="file" accept="image/*" @change="onUpload" />
				</label>
				<label class="row"><span>主标题</span><input v-model="state.title" /></label>
				<label class="row"><span>副标题</span><input v-model="state.subtitle" /></label>
				<label class="row"><span>展示贴纸</span><input type="checkbox" v-model="state.showStickers" /></label>
				<div class="subrows" v-if="state.showStickers">
					<label class="row"><span>月光</span><input type="checkbox" v-model="state.moonGlow" /></label>
					<label class="row"><span>灯笼</span><input type="checkbox" v-model="state.lanterns" /></label>
					<label class="row"><span>桂花</span><input type="checkbox" v-model="state.petals" /></label>
				</div>
				<label class="row"><span>签名/说明</span><input v-model="state.qrText" /></label>
				<button class="btn primary" @click="download">下载贺卡</button>
			</div>
		</div>
	</section>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #ffd3d3; border-radius: 12px; padding: 16px; color: #7a0000; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 1024px) { .grid { grid-template-columns: 1fr 360px; align-items: start; } }
.canvas { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); background: repeating-conic-gradient(#f6f6f6 0 25%, #fafafa 0 50%) 0/16px 16px; }
.right .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.right input[type="file"] { max-width: 220px; }
.right input, .right select { flex: 1; }
.subrows { padding-left: 10px; display: grid; gap: 6px; }
.btn { background: rgba(179,0,0,0.08); color: #7a0000; padding: 10px 14px; border-radius: 10px; text-decoration: none; border: 1px solid #ffbcbc; }
.btn.primary { background: #ffd700; color: #7a0000; border: none; }
</style>

