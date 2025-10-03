<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

const canvasRef = ref(null);
const ctxRef = ref(null);
const size = 512;

const state = reactive({
	image: null,
	imageUrl: '',
	loadedImg: null,
	shape: 'circle', // circle | rounded
	mask: 'gold-ring', // gold-ring | moon-lantern | red-ribbon | osmanthus-wreath | rabbit-ears | neon-ring | lantern-corners | rainbow-corner | star-confetti
	ringEnabled: true,
	ringColor: '#ffd700',
	ringWidth: 12,
	scale: 1,
	offsetX: 0,
	offsetY: 0,
	// 叠加贴纸（参考 portrait-generate）
	overlayBase: '/portrait/',
	overlayList: ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png'],
	overlayIndex: -1,
	loadedOverlay: null
});

function onUpload(e) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	state.image = file;
	state.imageUrl = URL.createObjectURL(file);
	const img = new Image();
	img.onload = () => { state.loadedImg = img; draw(); };
	img.src = state.imageUrl;
}

function draw() {
	const canvas = canvasRef.value;
	if (!canvas) return;
	const ctx = ctxRef.value || canvas.getContext('2d');
	ctxRef.value = ctx;
	ctx.clearRect(0, 0, size, size);

	// background transparent
	ctx.save();
	// clip shape
	if (state.shape === 'circle') {
		ctx.beginPath();
		ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2);
		ctx.closePath();
		ctx.clip();
	} else {
		const r = 48;
		roundedRect(ctx, 2, 2, size-4, size-4, r);
		ctx.clip();
	}

	// draw uploaded image
	if (state.loadedImg) {
		const img = state.loadedImg;
		const base = Math.min(img.width, img.height);
		const sx = (img.width - base)/2;
		const sy = (img.height - base)/2;
		const drawSize = size * state.scale;
		const dx = (size - drawSize)/2 + state.offsetX;
		const dy = (size - drawSize)/2 + state.offsetY;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(img, sx, sy, base, base, dx, dy, drawSize, drawSize);
	}
	ctx.restore();

	// shape-following ring (color/width configurable)
	if (state.ringEnabled) drawShapeRing(ctx);

	// overlay masks
	if (state.mask === 'gold-ring' && state.shape === 'circle') drawGoldRing(ctx);
	if (state.mask === 'moon-lantern') drawMoonLantern(ctx);
	if (state.mask === 'red-ribbon') drawRedRibbon(ctx);
	if (state.mask === 'osmanthus-wreath') drawOsmanthusWreath(ctx);
	if (state.mask === 'rabbit-ears') drawRabbitEars(ctx);
	if (state.mask === 'neon-ring' && state.shape === 'circle') drawNeonRing(ctx);
	if (state.mask === 'lantern-corners') drawLanternCorners(ctx);
	if (state.mask === 'rainbow-corner') drawRainbowCorner(ctx);
	if (state.mask === 'star-confetti') drawStarConfetti(ctx);

	// portrait叠加贴纸
	if (state.loadedOverlay) {
		ctx.save();
		ctx.globalCompositeOperation = 'source-over';
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(state.loadedOverlay, 0, 0, size, size);
		ctx.restore();
	}
}

function roundedRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.arcTo(x+w, y, x+w, y+h, r);
	ctx.arcTo(x+w, y+h, x, y+h, r);
	ctx.arcTo(x, y+h, x, y, r);
	ctx.arcTo(x, y, x+w, y, r);
	ctx.closePath();
}

function drawGoldRing(ctx) {
	// outer ring
	const grd = ctx.createLinearGradient(0,0,size,0);
	grd.addColorStop(0,'#ffef99');
	grd.addColorStop(0.5,'#ffd700');
	grd.addColorStop(1,'#ffef99');
	ctx.lineWidth = 18;
	ctx.strokeStyle = grd;
	ctx.beginPath();
	ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI*2);
	ctx.stroke();
	// inner shadow
	ctx.lineWidth = 4;
	ctx.strokeStyle = 'rgba(122,0,0,.25)';
	ctx.beginPath();
	ctx.arc(size/2, size/2, size/2 - 20, 0, Math.PI*2);
	ctx.stroke();
}

function drawShapeRing(ctx) {
	ctx.save();
	ctx.lineWidth = state.ringWidth;
	ctx.strokeStyle = state.ringColor;
	ctx.shadowColor = 'rgba(0,0,0,.08)';
	ctx.shadowBlur = 6;
	if (state.shape === 'circle') {
		ctx.beginPath();
		ctx.arc(size/2, size/2, size/2 - state.ringWidth/2 - 2, 0, Math.PI*2);
		ctx.stroke();
	} else {
		const inset = 2 + state.ringWidth/2;
		const r = 48;
		ctx.beginPath();
		roundedRect(ctx, inset, inset, size - inset*2, size - inset*2, r);
		ctx.stroke();
	}
	ctx.restore();
}

function drawMoonLantern(ctx) {
	// top moon glow
	const r = 90;
	const cx = size*0.78, cy = size*0.22;
	const rad = ctx.createRadialGradient(cx-20, cy-20, r*0.2, cx, cy, r);
	rad.addColorStop(0, '#fff7cc');
	rad.addColorStop(0.5, '#ffd76a');
	rad.addColorStop(1, 'rgba(255,215,0,0)');
	ctx.fillStyle = rad;
	ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
	// lanterns (simple)
	ctx.save();
	ctx.font = '48px system-ui';
	ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
	ctx.fillText('🏮', size*0.12, size*0.18);
	ctx.fillText('🏮', size*0.86, size*0.26);
	ctx.restore();
	// thin ring
	ctx.lineWidth = 8;
	ctx.strokeStyle = 'rgba(255,215,0,.65)';
	ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - 6, 0, Math.PI*2); ctx.stroke();
}

function drawRedRibbon(ctx) {
	ctx.save();
	ctx.globalAlpha = .85;
	ctx.fillStyle = ctx.createLinearGradient(0,0,size,0);
	ctx.fillStyle.addColorStop?.call(ctx.fillStyle,0,'rgba(209,0,0,.75)');
	ctx.fillStyle.addColorStop?.call(ctx.fillStyle,1,'rgba(255,215,0,.55)');
	ctx.fillRect(0, size-40, size, 40);
	ctx.restore();
	// corner badge
	ctx.save();
	ctx.translate(size-140, 20);
	ctx.rotate(-Math.PI/12);
	ctx.fillStyle = '#d10000';
	ctx.fillRect(0,0,160,26);
	ctx.fillStyle = '#fff';
	ctx.font = 'bold 18px system-ui';
	ctx.fillText('中秋团圆 • 博饼同乐', 10, 18);
	ctx.restore();
}

function drawOsmanthusWreath(ctx) {
	ctx.save();
	ctx.font = '24px system-ui';
	ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 6;
	const petals = 24;
	for (let i=0;i<petals;i++) {
		const ang = (i/petals)*Math.PI*2;
		const rx = (size/2) + Math.cos(ang)*(size/2 - 26);
		const ry = (size/2) + Math.sin(ang)*(size/2 - 26);
		ctx.fillText('🌼', rx-12, ry+8);
	}
	ctx.restore();
}

function drawRabbitEars(ctx) {
	ctx.save();
	ctx.translate(size/2, 0);
	// left ear
	ctx.fillStyle = '#fff';
	roundedEar(ctx, -70, 20, 50, 140, 25);
	ctx.fillStyle = '#ffc0cb';
	roundedEar(ctx, -55, 40, 25, 100, 18);
	// right ear
	ctx.fillStyle = '#fff';
	roundedEar(ctx, 20, 20, 50, 140, 25);
	ctx.fillStyle = '#ffc0cb';
	roundedEar(ctx, 35, 40, 25, 100, 18);
	ctx.restore();
}

function roundedEar(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.arcTo(x+w, y, x+w, y+h, r);
	ctx.arcTo(x+w, y+h, x, y+h, r);
	ctx.arcTo(x, y+h, x, y, r);
	ctx.arcTo(x, y, x+w, y, r);
	ctx.closePath();
	ctx.fill();
}

function drawNeonRing(ctx) {
	const grd = ctx.createLinearGradient(0,0,size,0);
	grd.addColorStop(0,'#ff4d4d');
	grd.addColorStop(0.5,'#ffd700');
	grd.addColorStop(1,'#ff4d4d');
	ctx.lineWidth = 10;
	ctx.strokeStyle = grd;
	ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18;
	ctx.beginPath();
	ctx.arc(size/2, size/2, size/2 - 14, 0, Math.PI*2);
	ctx.stroke();
}

function drawLanternCorners(ctx) {
	ctx.save();
	ctx.font = '42px system-ui';
	ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
	ctx.fillText('🏮', 14, 44);
	ctx.fillText('🏮', size-56, 44);
	ctx.fillText('🏮', 14, size-10);
	ctx.fillText('🏮', size-56, size-10);
	ctx.restore();
}

function drawRainbowCorner(ctx) {
	ctx.save();
	const grd = ctx.createLinearGradient(0, size, size*0.6, size*0.6);
	grd.addColorStop(0,'#ff5252');
	grd.addColorStop(0.33,'#ffd740');
	grd.addColorStop(0.66,'#40c4ff');
	grd.addColorStop(1,'#7c4dff');
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.moveTo(size, size);
	ctx.lineTo(size, size-120);
	ctx.lineTo(size-120, size);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

function drawStarConfetti(ctx) {
	ctx.save();
	ctx.fillStyle = '#ffd700';
	for (let i=0;i<40;i++) {
		const x = Math.random()*size;
		const y = Math.random()*size;
		const r = 1 + Math.random()*2.5;
		ctx.beginPath();
		ctx.arc(x,y,r,0,Math.PI*2);
		ctx.fill();
	}
	ctx.restore();
}

function download() {
	const canvas = canvasRef.value; if (!canvas) return;
	const link = document.createElement('a');
	link.download = 'avatar.png';
	link.href = canvas.toDataURL('image/png');
	link.click();
}

function setOverlayByIndex(i) {
	if (i < 0 || i >= state.overlayList.length) { state.overlayIndex = -1; state.loadedOverlay = null; draw(); return; }
	state.overlayIndex = i;
	const url = state.overlayBase + state.overlayList[i];
	const img = new Image();
	img.onload = () => { state.loadedOverlay = img; draw(); };
	img.onerror = () => { state.loadedOverlay = null; draw(); };
	img.src = url;
}

function prevOverlay() {
	if (!state.overlayList.length) return;
	if (state.overlayIndex === -1) { setOverlayByIndex(0); return; }
	const next = (state.overlayIndex - 1 + state.overlayList.length) % state.overlayList.length;
	setOverlayByIndex(next);
}

function nextOverlay() {
	if (!state.overlayList.length) return;
	if (state.overlayIndex === -1) { setOverlayByIndex(0); return; }
	const next = (state.overlayIndex + 1) % state.overlayList.length;
	setOverlayByIndex(next);
}

function randomOverlay() {
	if (!state.overlayList.length) return;
	const idx = Math.floor(Math.random() * state.overlayList.length);
	setOverlayByIndex(idx);
}

function clearOverlay() { setOverlayByIndex(-1); }

function onUploadOverlay(e) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	const url = URL.createObjectURL(file);
	const img = new Image();
	img.onload = () => { state.loadedOverlay = img; state.overlayIndex = -1; draw(); };
	img.src = url;
}

watch(() => [state.shape, state.mask, state.scale, state.offsetX, state.offsetY, state.loadedImg, state.loadedOverlay], draw, { deep: true });
onMounted(draw);
</script>

<template>
	<section class="avatar">
		<h2>头像定制</h2>
		<div class="grid">
			<div class="left">
				<canvas ref="canvasRef" :width="size" :height="size" class="canvas"></canvas>
				<div class="tips">建议上传方形图片，或用缩放与偏移微调。</div>
			</div>
			<div class="right">
				<label class="row">
					<span>上传图片</span>
					<input type="file" accept="image/*" @change="onUpload" />
				</label>
				<label class="row">
					<span>裁剪形状</span>
					<select v-model="state.shape">
						<option value="circle">圆形</option>
						<option value="rounded">圆角方形</option>
					</select>
				</label>
				<label class="row">
					<span>遮罩模板</span>
					<select v-model="state.mask">
						<option value="gold-ring">金色光环（圆形）</option>
						<option value="neon-ring">霓虹光环（圆形）</option>
						<option value="moon-lantern">明月灯笼</option>
						<option value="osmanthus-wreath">桂花花环</option>
						<option value="rabbit-ears">玉兔耳朵</option>
						<option value="lantern-corners">四角灯笼</option>
						<option value="red-ribbon">红色丝带</option>
						<option value="rainbow-corner">彩虹转角</option>
						<option value="star-confetti">星光点点</option>
					</select>
				</label>
				<div class="row">
					<span>国庆贴纸</span>
					<div style="display:flex; gap:8px; flex:1; justify-content:flex-end;">
						<button class="btn" @click="prevOverlay">上一个</button>
						<button class="btn" @click="nextOverlay">下一个</button>
						<button class="btn" @click="randomOverlay">随机</button>
						<button class="btn" @click="clearOverlay">清除</button>
					</div>
				</div>
				<label class="row">
					<span>自定义贴纸</span>
					<input type="file" accept="image/*" @change="onUploadOverlay" />
				</label>
	<div class="row">
		<span>环形边框</span>
		<label style="display:flex; align-items:center; gap:8px;">
			<input type="checkbox" v-model="state.ringEnabled" /> 启用
		</label>
	</div>
	<label class="row">
		<span>边框颜色</span>
		<input type="color" v-model="state.ringColor" />
	</label>
	<label class="row">
		<span>边框粗细</span>
		<input type="range" min="2" max="36" step="1" v-model.number="state.ringWidth" />
	</label>
				<label class="row">
					<span>缩放</span>
					<input type="range" min="0.6" max="2" step="0.02" v-model.number="state.scale" />
				</label>
				<label class="row">
					<span>水平偏移</span>
					<input type="range" min="-150" max="150" step="1" v-model.number="state.offsetX" />
				</label>
				<label class="row">
					<span>垂直偏移</span>
					<input type="range" min="-150" max="150" step="1" v-model.number="state.offsetY" />
				</label>
				<button class="btn primary" @click="download">下载头像</button>
			</div>
		</div>
	</section>
</template>

<style scoped>
.avatar { background: #fff; border: 1px solid #ffd3d3; border-radius: 12px; padding: 16px; color: #7a0000; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 960px) { .grid { grid-template-columns: 1fr 320px; } }
.canvas { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); background: repeating-conic-gradient(#f6f6f6 0 25%, #fafafa 0 50%) 0/16px 16px; }
.tips { opacity: .8; margin-top: 8px; }
.right .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.right input[type="file"] { max-width: 200px; }
.right select, .right input[type="range"] { flex: 1; }
.btn { background: rgba(179,0,0,0.08); color: #7a0000; padding: 10px 14px; border-radius: 10px; text-decoration: none; border: 1px solid #ffbcbc; }
.btn.primary { background: #ffd700; color: #7a0000; border: none; }
</style>

