<script setup>
import { ref, reactive, onMounted } from 'vue';

let canvas = null;
const canvasId = 'card-pro-canvas';

// 根据屏幕尺寸动态调整画布尺寸
function getCanvasSize() {
	const isMobile = window.innerWidth <= 768;
	if (isMobile) {
		const maxWidth = Math.min(window.innerWidth - 40, 400); // 移动端最大宽度400px
		return {
			W: maxWidth,
			H: Math.round(maxWidth * 1.33) // 保持3:4比例
		};
	}
	// PC 端固定画布宽度为 635px，并保持 3:4 比例
	const desktopW = 635;
	return { W: desktopW, H: Math.round(desktopW * 1.33) };
}

const { W, H } = getCanvasSize();

const state = reactive({
	bg: 'minimal', // solid-red | gradient-red | image | mid-autumn
	bgImageUrl: '',
	assetsBase: '/img/',
	midAutumnBase: '/mid-autumn/',
	layers: [],
	selected: null,
	avatarFrame: 'none', // none | circle | square | flower | star | heart | diamond
	inspector: {
		text: '',
		fill: '#ffd700',
		fontSize: 64,
		stroke: '#7a0000',
		strokeWidth: 0,
		shadow: false,
		opacity: 1,
		angle: 0,
		scale: 1
	}
});

function initCanvas() {
	// 重新获取画布尺寸（处理窗口大小变化）
	const { W: currentW, H: currentH } = getCanvasSize();
	
	// fabric is loaded via index.html
	// eslint-disable-next-line no-undef
	canvas = new fabric.Canvas(canvasId, { 
		width: currentW, 
		height: currentH, 
		preserveObjectStacking: true, 
		selection: true, 
		centeredScaling: true 
	});
	// eslint-disable-next-line no-undef
	fabric.Object.prototype.originX = 'center';
	// eslint-disable-next-line no-undef
	fabric.Object.prototype.originY = 'center';
	canvas.on('selection:created', e => { state.selected = e.selected?.[0] || null; syncInspector(); });
	canvas.on('selection:updated', e => { state.selected = e.selected?.[0] || null; syncInspector(); });
	canvas.on('selection:cleared', () => { state.selected = null; });
	canvas.on('object:added', refreshLayers);
	canvas.on('object:removed', refreshLayers);
	canvas.on('object:modified', refreshLayers);
	enableSnap();
	applyBackground();
}

function applyBackground() {
	if (!canvas) return;
	const { W: currentW, H: currentH } = getCanvasSize();
	
	if (state.bg === 'minimal') {
		// eslint-disable-next-line no-undef
		canvas.setBackgroundColor('#fefefe', canvas.renderAll.bind(canvas));
	} else if (state.bg === 'solid-red') {
		// eslint-disable-next-line no-undef
		canvas.setBackgroundColor('#d10000', canvas.renderAll.bind(canvas));
	} else if (state.bg === 'gradient-red') {
		// eslint-disable-next-line no-undef
		const grad = new fabric.Gradient({
			type: 'linear',
			coords: { x1: 0, y1: 0, x2: 0, y2: currentH },
			colorStops: [
				{ offset: 0, color: '#7a0000' },
				{ offset: 1, color: '#d10000' }
			]
		});
		canvas.setBackgroundColor(grad, canvas.renderAll.bind(canvas));
	} else if (state.bg === 'image' && state.bgImageUrl) {
		// eslint-disable-next-line no-undef
		fabric.Image.fromURL(state.bgImageUrl, (img) => {
			const scale = Math.max(currentW / img.width, currentH / img.height);
			img.set({ left: currentW/2, top: currentH/2, originX: 'center', originY: 'center', selectable: false, evented: false, scaleX: scale, scaleY: scale });
			canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
		});
	} else if (state.bg.startsWith('mid-autumn-')) {
		const bgName = state.bg.replace('mid-autumn-', 'mid-autumn'); // 将 'mid-autumn-3' 转换为 'mid-autumn3'
		// eslint-disable-next-line no-undef
		fabric.Image.fromURL(state.midAutumnBase + bgName + '.png', (img) => {
			const scale = Math.max(currentW / img.width, currentH / img.height);
			img.set({ left: currentW/2, top: currentH/2, originX: 'center', originY: 'center', selectable: false, evented: false, scaleX: scale, scaleY: scale });
			canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
		});
	}
}

function onUploadBg(e) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	state.bgImageUrl = URL.createObjectURL(file);
	state.bg = 'image';
	applyBackground();
}

function addImage(name) {
	const { W: currentW, H: currentH } = getCanvasSize();
	// eslint-disable-next-line no-undef
	fabric.Image.fromURL(state.assetsBase + name, (img) => {
		// 移动端缩放图片
		const isMobile = window.innerWidth <= 768;
		const scale = isMobile ? 0.6 : 1; // 移动端图片缩小到60%
		img.set({ 
			left: currentW/2, 
			top: currentH/2, 
			originX: 'center', 
			originY: 'center', 
			cornerStyle: 'circle', 
			transparentCorners: false,
			scaleX: scale,
			scaleY: scale
		});
		img.name = name;
		canvas.add(img);
		canvas.setActiveObject(img);
		canvas.requestRenderAll();
		refreshLayers();
	});
}

function addAvatar() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.onchange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		const { W: currentW, H: currentH } = getCanvasSize();
		// eslint-disable-next-line no-undef
		fabric.Image.fromURL(url, (img) => {
			// 移动端缩放头像
			const isMobile = window.innerWidth <= 768;
			const scale = isMobile ? 0.5 : 0.8; // 移动端头像更小
			
			// 根据选择的框架类型设置裁剪路径
			let clipPath = null;
			if (state.avatarFrame === 'circle') {
				clipPath = new fabric.Circle({ radius: Math.min(img.width, img.height) / 2, originX: 'center', originY: 'center' });
			} else if (state.avatarFrame === 'square') {
				const size = Math.min(img.width, img.height);
				clipPath = new fabric.Rect({ width: size, height: size, originX: 'center', originY: 'center' });
			} else if (state.avatarFrame === 'flower') {
				clipPath = createFlowerClipPath(Math.min(img.width, img.height) / 2);
			} else if (state.avatarFrame === 'star') {
				clipPath = createStarClipPath(Math.min(img.width, img.height) / 2);
			} else if (state.avatarFrame === 'heart') {
				clipPath = createHeartClipPath(Math.min(img.width, img.height) / 2);
			} else if (state.avatarFrame === 'diamond') {
				clipPath = createDiamondClipPath(Math.min(img.width, img.height) / 2);
			}
			
            // 让图片在组内居中
            img.set({ 
                left: 0, 
                top: 0, 
                originX: 'center', 
                originY: 'center',
                cornerStyle: 'circle',
                transparentCorners: false,
                scaleX: scale,
                scaleY: scale,
                clipPath: clipPath
            });
            img.name = '头像';

            // 生成外框（与图片分组，保证联动）
            let frame = null;
            if (state.avatarFrame !== 'none') {
                frame = buildAvatarFrameForGroup(img, scale);
            }
            const children = frame ? [img, frame] : [img];
            const group = new fabric.Group(children, { left: currentW/2, top: currentH/2, originX: 'center', originY: 'center' });
            group.name = '头像组';
            canvas.add(group);
            canvas.setActiveObject(group);
			canvas.requestRenderAll();
			refreshLayers();
		});
	};
	input.click();
}

// 创建花朵形状的裁剪路径
function createFlowerClipPath(radius) {
	// eslint-disable-next-line no-undef
	const path = new fabric.Path('M 0,-' + radius + ' C ' + (radius * 0.3) + ',-' + (radius * 0.8) + ' ' + (radius * 0.8) + ',-' + (radius * 0.3) + ' ' + radius + ',0 C ' + (radius * 0.8) + ',' + (radius * 0.3) + ' ' + (radius * 0.3) + ',' + (radius * 0.8) + ' 0,' + radius + ' C -' + (radius * 0.3) + ',' + (radius * 0.8) + ' -' + (radius * 0.8) + ',' + (radius * 0.3) + ' -' + radius + ',0 C -' + (radius * 0.8) + ',-' + (radius * 0.3) + ' -' + (radius * 0.3) + ',-' + (radius * 0.8) + ' 0,-' + radius + ' Z', {
		originX: 'center',
		originY: 'center'
	});
	return path;
}

// 创建星形裁剪路径
function createStarClipPath(radius) {
	const points = [];
	const numPoints = 5;
	for (let i = 0; i < numPoints * 2; i++) {
		const angle = (i * Math.PI) / numPoints;
		const r = i % 2 === 0 ? radius : radius * 0.4;
		points.push({
			x: Math.cos(angle) * r,
			y: Math.sin(angle) * r
		});
	}
	// eslint-disable-next-line no-undef
	const path = new fabric.Polygon(points, {
		originX: 'center',
		originY: 'center'
	});
	return path;
}

// 创建心形裁剪路径
function createHeartClipPath(radius) {
	// eslint-disable-next-line no-undef
	const path = new fabric.Path('M 0,' + (radius * 0.3) + ' C 0,' + (radius * 0.1) + ' -' + (radius * 0.2) + ',0 -' + (radius * 0.5) + ',0 C -' + (radius * 0.8) + ',0 -' + radius + ',' + (radius * 0.2) + ' -' + radius + ',' + (radius * 0.5) + ' C -' + radius + ',' + (radius * 0.8) + ' 0,' + radius + ' 0,' + radius + ' C 0,' + radius + ' ' + radius + ',' + (radius * 0.8) + ' ' + radius + ',' + (radius * 0.5) + ' C ' + radius + ',' + (radius * 0.2) + ' ' + (radius * 0.8) + ',0 ' + (radius * 0.5) + ',0 C ' + (radius * 0.2) + ',0 0,' + (radius * 0.1) + ' 0,' + (radius * 0.3) + ' Z', {
		originX: 'center',
		originY: 'center'
	});
	return path;
}

// 创建菱形裁剪路径
function createDiamondClipPath(radius) {
	// eslint-disable-next-line no-undef
	const path = new fabric.Polygon([
		{ x: 0, y: -radius },
		{ x: radius, y: 0 },
		{ x: 0, y: radius },
		{ x: -radius, y: 0 }
	], {
		originX: 'center',
		originY: 'center'
	});
	return path;
}

// 添加头像装饰外框
function addAvatarFrame(avatarImg, x, y, scale) {
	const frameSize = Math.min(avatarImg.width, avatarImg.height) * scale;
	const frameRadius = frameSize / 2;
	
	// eslint-disable-next-line no-undef
	let frame = null;
	
	if (state.avatarFrame === 'circle') {
		// 圆形外框
		frame = new fabric.Circle({
			radius: frameRadius + 8,
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ffd700',
			strokeWidth: 4,
			selectable: false,
			evented: false
		});
	} else if (state.avatarFrame === 'square') {
		// 方形外框
		frame = new fabric.Rect({
			width: frameSize + 16,
			height: frameSize + 16,
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ffd700',
			strokeWidth: 4,
			selectable: false,
			evented: false
		});
	} else if (state.avatarFrame === 'flower') {
		// 花朵外框
		frame = new fabric.Circle({
			radius: frameRadius + 12,
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ff6b9d',
			strokeWidth: 6,
			strokeDashArray: [10, 5],
			selectable: false,
			evented: false
		});
	} else if (state.avatarFrame === 'star') {
		// 星形外框
		const points = [];
		const numPoints = 5;
		const outerRadius = frameRadius + 10;
		const innerRadius = frameRadius + 5;
		for (let i = 0; i < numPoints * 2; i++) {
			const angle = (i * Math.PI) / numPoints;
			const r = i % 2 === 0 ? outerRadius : innerRadius;
			points.push({
				x: Math.cos(angle) * r,
				y: Math.sin(angle) * r
			});
		}
		frame = new fabric.Polygon(points, {
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ffd700',
			strokeWidth: 3,
			selectable: false,
			evented: false
		});
	} else if (state.avatarFrame === 'heart') {
		// 心形外框
		frame = new fabric.Circle({
			radius: frameRadius + 8,
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ff6b9d',
			strokeWidth: 4,
			selectable: false,
			evented: false
		});
	} else if (state.avatarFrame === 'diamond') {
		// 菱形外框
		frame = new fabric.Polygon([
			{ x: 0, y: -(frameRadius + 8) },
			{ x: frameRadius + 8, y: 0 },
			{ x: 0, y: frameRadius + 8 },
			{ x: -(frameRadius + 8), y: 0 }
		], {
			left: x,
			top: y,
			originX: 'center',
			originY: 'center',
			fill: 'transparent',
			stroke: '#ffd700',
			strokeWidth: 4,
			selectable: false,
			evented: false
		});
	}
	
	if (frame) {
		frame.name = '头像外框';
		canvas.add(frame);
		canvas.sendToBack(frame); // 将外框放在头像后面
	}
}

// 分组场景使用的外框生成器（以组中心为0,0）
function buildAvatarFrameForGroup(avatarImg, scale) {
    const frameSize = Math.min(avatarImg.width, avatarImg.height) * scale;
    const frameRadius = frameSize / 2;
    let frame = null;
    if (state.avatarFrame === 'circle') {
        frame = new fabric.Circle({ radius: frameRadius + 8, left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd700', strokeWidth: 4, selectable: false, evented: false });
    } else if (state.avatarFrame === 'square') {
        frame = new fabric.Rect({ width: frameSize + 16, height: frameSize + 16, left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd700', strokeWidth: 4, selectable: false, evented: false });
    } else if (state.avatarFrame === 'flower') {
        frame = new fabric.Circle({ radius: frameRadius + 12, left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ff6b9d', strokeWidth: 6, strokeDashArray: [10, 5], selectable: false, evented: false });
    } else if (state.avatarFrame === 'star') {
        const points = []; const numPoints = 5; const outerRadius = frameRadius + 10; const innerRadius = frameRadius + 5;
        for (let i = 0; i < numPoints * 2; i++) { const angle = (i * Math.PI) / numPoints; const r = i % 2 === 0 ? outerRadius : innerRadius; points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r }); }
        frame = new fabric.Polygon(points, { left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd700', strokeWidth: 3, selectable: false, evented: false });
    } else if (state.avatarFrame === 'heart') {
        frame = new fabric.Circle({ radius: frameRadius + 8, left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ff6b9d', strokeWidth: 4, selectable: false, evented: false });
    } else if (state.avatarFrame === 'diamond') {
        frame = new fabric.Polygon([{ x: 0, y: -(frameRadius + 8) }, { x: frameRadius + 8, y: 0 }, { x: 0, y: frameRadius + 8 }, { x: -(frameRadius + 8), y: 0 }], { left: 0, top: 0, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd700', strokeWidth: 4, selectable: false, evented: false });
    }
    if (frame) frame.name = '头像外框';
    return frame;
}
// 给现有头像添加外框
function addFrameToExistingAvatar() {
    // 优先查找头像组
    const group = canvas.getObjects().find(obj => obj.name === '头像组');
    // 如果没有组，尝试找独立头像
    if (!group) {
        const loneAvatar = canvas.getObjects().find(obj => obj.name === '头像');
        if (!loneAvatar) { alert('请先上传头像'); return; }
        const left = loneAvatar.left; const top = loneAvatar.top; const angle = loneAvatar.angle || 0; const scaleX = loneAvatar.scaleX || 1; const scaleY = loneAvatar.scaleY || 1;
        // 克隆头像，归一到组局部坐标，并依据新外框形状更新裁剪
        loneAvatar.clone((cloned) => {
            cloned.set({ left: 0, top: 0, originX: 'center', originY: 'center' });
            // 依据当前选择的外框，重建 clipPath（遮罩）
            const baseSize = Math.min(cloned.width, cloned.height);
            if (state.avatarFrame === 'circle') {
                cloned.clipPath = new fabric.Circle({ radius: baseSize/2, originX: 'center', originY: 'center' });
            } else if (state.avatarFrame === 'square') {
                cloned.clipPath = new fabric.Rect({ width: baseSize, height: baseSize, originX: 'center', originY: 'center' });
            } else if (state.avatarFrame === 'flower') {
                cloned.clipPath = createFlowerClipPath(baseSize/2);
            } else if (state.avatarFrame === 'star') {
                cloned.clipPath = createStarClipPath(baseSize/2);
            } else if (state.avatarFrame === 'heart') {
                cloned.clipPath = createHeartClipPath(baseSize/2);
            } else if (state.avatarFrame === 'diamond') {
                cloned.clipPath = createDiamondClipPath(baseSize/2);
            } else {
                cloned.clipPath = null;
            }
            // 生成新外框
            let frame = null;
            if (state.avatarFrame !== 'none') {
                frame = buildAvatarFrameForGroup(cloned, scaleX);
            }
            const children = frame ? [cloned, frame] : [cloned];
            // 创建新组并还原位置/角度/缩放
            // eslint-disable-next-line no-undef
            const newGroup = new fabric.Group(children, { left, top, originX: 'center', originY: 'center', angle, scaleX, scaleY });
            newGroup.name = '头像组';
            canvas.remove(loneAvatar);
            canvas.add(newGroup);
            canvas.setActiveObject(newGroup);
            canvas.requestRenderAll();
            refreshLayers();
        });
        return;
    }
    // 组内找到头像
    const avatar = group._objects?.find?.(o => o.name === '头像');
    if (!avatar) return;
    // 记录组变换
    const gLeft = group.left; const gTop = group.top; const gAngle = group.angle || 0; const gScaleX = group.scaleX || 1; const gScaleY = group.scaleY || 1;
    const aScale = avatar.scaleX || 1;
    // 克隆头像用于新组，并同步遮罩
    avatar.clone((cloned) => {
        cloned.set({ left: 0, top: 0, originX: 'center', originY: 'center' });
        const baseSize = Math.min(cloned.width, cloned.height);
        if (state.avatarFrame === 'circle') {
            cloned.clipPath = new fabric.Circle({ radius: baseSize/2, originX: 'center', originY: 'center' });
        } else if (state.avatarFrame === 'square') {
            cloned.clipPath = new fabric.Rect({ width: baseSize, height: baseSize, originX: 'center', originY: 'center' });
        } else if (state.avatarFrame === 'flower') {
            cloned.clipPath = createFlowerClipPath(baseSize/2);
        } else if (state.avatarFrame === 'star') {
            cloned.clipPath = createStarClipPath(baseSize/2);
        } else if (state.avatarFrame === 'heart') {
            cloned.clipPath = createHeartClipPath(baseSize/2);
        } else if (state.avatarFrame === 'diamond') {
            cloned.clipPath = createDiamondClipPath(baseSize/2);
        } else {
            cloned.clipPath = null;
        }
        // 生成新外框
        let frame = null;
        if (state.avatarFrame !== 'none') {
            frame = buildAvatarFrameForGroup(cloned, aScale);
        }
        const children = frame ? [cloned, frame] : [cloned];
        // eslint-disable-next-line no-undef
        const newGroup = new fabric.Group(children, { left: gLeft, top: gTop, originX: 'center', originY: 'center', angle: gAngle, scaleX: gScaleX, scaleY: gScaleY });
        newGroup.name = '头像组';
        canvas.remove(group);
        canvas.add(newGroup);
        canvas.setActiveObject(newGroup);
        canvas.requestRenderAll();
        refreshLayers();
    });
}

function addText() {
	const { W: currentW, H: currentH } = getCanvasSize();
	const isMobile = window.innerWidth <= 768;
	const fontSize = isMobile ? 32 : 64; // 移动端字体更小
	// eslint-disable-next-line no-undef
	const text = new fabric.Textbox('中秋快乐', { 
		left: currentW/2, 
		top: currentH*0.15, 
		originX: 'center', 
		originY: 'center', 
		fill: '#ffd700', 
		fontSize: fontSize, 
		fontWeight: 'bold' 
	});
	text.name = '文本';
	canvas.add(text);
	canvas.setActiveObject(text);
	canvas.requestRenderAll();
	refreshLayers();
}

function addVText() {
	const { W: currentW, H: currentH } = getCanvasSize();
	const isMobile = window.innerWidth <= 768;
	const fontSize = isMobile ? 28 : 56; // 移动端字体更小
	const offsetX = isMobile ? -80 : -200; // 移动端偏移更小
	// 竖排：将字符串用\n拆分
	// eslint-disable-next-line no-undef
	const text = new fabric.Textbox('福\n满\n中\n秋', { 
		left: currentW/2 + offsetX, 
		top: currentH*0.2, 
		originX: 'center', 
		originY: 'center', 
		fill: '#ffd700', 
		fontSize: fontSize, 
		fontWeight: 'bold', 
		textAlign: 'center' 
	});
	text.name = '竖排文本';
	canvas.add(text);
	canvas.setActiveObject(text);
	canvas.requestRenderAll();
	refreshLayers();
}

function bringToFront() {
	const obj = canvas?.getActiveObject(); if (!obj) return;
	obj.bringToFront(); canvas.requestRenderAll();
}
function sendToBack() {
	const obj = canvas?.getActiveObject(); if (!obj) return;
	obj.sendToBack(); canvas.requestRenderAll();
}
function deleteObject() {
	const obj = canvas?.getActiveObject(); if (!obj) return;
	canvas.remove(obj); canvas.requestRenderAll(); refreshLayers();
}

function download() {
	const link = document.createElement('a');
	link.download = 'moon-card-pro.png';
	link.href = canvas.toDataURL({ format: 'png' });
	link.click();
}

onMounted(() => {
    initCanvas();
    // 为避免上传图片等动作导致布局细微变化触发 resize 而重建画布，这里暂不自动重建
});
// 简单中心/边缘吸附
// eslint-disable-next-line no-undef
const SNAP = 10;
function snapObject(obj) {
    if (!obj) return;
    const { W: currentW, H: currentH } = getCanvasSize();
    const cx = obj.left, cy = obj.top;
    if (Math.abs(cx - currentW/2) < SNAP) obj.left = currentW/2;
    if (Math.abs(cy - currentH/2) < SNAP) obj.top = currentH/2;
    if (Math.abs(cx - 0) < SNAP) obj.left = 0;
    if (Math.abs(cx - currentW) < SNAP) obj.left = currentW;
    if (Math.abs(cy - 0) < SNAP) obj.top = 0;
    if (Math.abs(cy - currentH) < SNAP) obj.top = currentH;
}
// eslint-disable-next-line no-undef
function enableSnap() { canvas.on('object:moving', e => { snapObject(e.target); }); }

function applyInspector() {
	const obj = canvas?.getActiveObject(); if (!obj) return;
	if ('text' in obj) obj.text = state.inspector.text;
	if ('fill' in obj) obj.set('fill', state.inspector.fill);
	if ('fontSize' in obj) obj.set('fontSize', state.inspector.fontSize);
	if ('stroke' in obj) obj.set('stroke', state.inspector.stroke);
	if ('strokeWidth' in obj) obj.set('strokeWidth', state.inspector.strokeWidth);
	if ('opacity' in obj) obj.set('opacity', state.inspector.opacity);
	if ('angle' in obj) obj.set('angle', state.inspector.angle);
	if ('scaleX' in obj && 'scaleY' in obj) obj.set({ scaleX: state.inspector.scale, scaleY: state.inspector.scale });
	if (state.inspector.shadow) obj.set('shadow', { color: 'rgba(0,0,0,.35)', blur: 12, offsetY: 6 }); else obj.set('shadow', undefined);
	canvas.requestRenderAll();
}

function syncInspector() {
	const obj = canvas?.getActiveObject(); if (!obj) return;
	state.inspector.text = 'text' in obj ? obj.text || '' : '';
	state.inspector.fill = obj.fill || '#000';
	state.inspector.fontSize = obj.fontSize || 32;
	state.inspector.stroke = obj.stroke || '#00000000';
	state.inspector.strokeWidth = obj.strokeWidth || 0;
	state.inspector.opacity = obj.opacity ?? 1;
	state.inspector.angle = obj.angle || 0;
	state.inspector.scale = obj.scaleX || 1;
}

function applyTemplate(name) {
	if (!canvas) return;
	const { W: currentW, H: currentH } = getCanvasSize();
	const isMobile = window.innerWidth <= 768;
	
	if (name === 'moon-celebrate') {
		state.bg = 'gradient-red'; applyBackground();
		addImage('moon.png');
		setTimeout(() => { 
			const t = canvas.getActiveObject(); 
			if (t) { 
				t.set({ 
					left: currentW*0.78, 
					top: currentH*0.18, 
					selectable: false, 
					evented: false 
				}); 
				canvas.requestRenderAll(); 
			} 
		}, 50);
		addText();
		setTimeout(() => { 
			const obj = canvas.getActiveObject(); 
			if (obj) { 
				const fontSize = isMobile ? 36 : 72;
				obj.set({ 
					text: '中秋快乐', 
					fill: '#ffd700', 
					fontSize: fontSize, 
					top: currentH*0.2 
				}); 
				canvas.requestRenderAll(); 
			} 
		}, 60);
	}
	if (name === 'rabbit-lamp') {
		state.bg = 'solid-red'; applyBackground();
		addImage('rabbit1.png');
		addImage('lamp.png');
		setTimeout(() => {
			const objs = canvas.getObjects();
			const lamp = objs.find(o => o.name==='lamp.png'); 
			if (lamp) {
				const scale = isMobile ? 0.5 : 0.9;
				lamp.set({ 
					left: currentW*0.86, 
					top: currentH*0.22, 
					scaleX: scale, 
					scaleY: scale, 
					selectable: false, 
					evented: false 
				});
			}
			const rabbit = objs.find(o => o.name==='rabbit1.png'); 
			if (rabbit) {
				rabbit.set({ 
					left: currentW*0.22, 
					top: currentH*0.82 
				});
			}
			canvas.requestRenderAll();
		}, 80);
	}
	if (name === 'minimal-title') {
		state.bg = 'minimal'; applyBackground();
		addText(); 
		setTimeout(() => { 
			const obj = canvas.getActiveObject(); 
			if (obj) { 
				const fontSize = isMobile ? 40 : 80;
				obj.set({ 
					text: '月圆人圆', 
					fill: '#7a0000', 
					fontSize: fontSize, 
					top: currentH*0.25 
				}); 
				canvas.requestRenderAll(); 
			} 
		}, 50);
	}
	refreshLayers();
}

function refreshLayers() {
	const objs = canvas.getObjects();
	state.layers = objs.map((o, idx) => ({ id: idx, name: o.name || o.type || `图层${idx+1}`, visible: o.visible !== false, locked: o.selectable === false, ref: o }));
}

function selectLayer(i) {
	const item = state.layers[i]; if (!item) return;
	canvas.setActiveObject(item.ref); canvas.requestRenderAll(); state.selected = item.ref; syncInspector();
}

function toggleVisible(i) {
	const item = state.layers[i]; if (!item) return;
	item.ref.visible = !item.ref.visible; item.visible = item.ref.visible; canvas.requestRenderAll();
}

function toggleLock(i) {
	const item = state.layers[i]; if (!item) return;
	item.ref.selectable = !item.ref.selectable; item.locked = !item.ref.selectable; canvas.requestRenderAll();
}

function renameLayer(i, e) {
	const item = state.layers[i]; if (!item) return; const val = e?.target?.value?.trim(); if (!val) return;
	item.ref.name = val; item.name = val; canvas.requestRenderAll();
}

function moveLayer(i, dir) {
	const item = state.layers[i]; if (!item) return;
	if (dir === 'up') item.ref.bringForward(); else item.ref.sendBackwards();
	canvas.requestRenderAll(); refreshLayers();
}
</script>

<template>
	<section class="card-pro">
		<h2>中秋贺卡 · 专业编辑</h2>
		<div class="layout">
			<div class="stage" :style="{ height: (H + 40) + 'px', overflow: 'hidden' }">
				<canvas :id="canvasId" :width="W" :height="H" :style="{ width: W + 'px', height: H + 'px' }"></canvas>
			</div>
			<div class="tools">
				<label class="row"><span>背景</span>
					<select v-model="state.bg" @change="applyBackground">
						<option value="minimal">简约白</option>
						<option value="solid-red">纯色红</option>
						<option value="gradient-red">红色渐变</option>
						<option value="image">上传图片</option>
						<option value="mid-autumn-1">中秋背景1</option>
						<option value="mid-autumn-2">中秋背景2</option>
						<option value="mid-autumn-3">中秋背景3</option>
						<option value="mid-autumn-4">中秋背景4</option>
						<option value="mid-autumn-5">中秋背景5</option>
						<option value="mid-autumn-6">中秋背景6</option>
					</select>
				</label>
				<div class="row" v-if="state.bg==='image'">
					<span>上传背景</span>
					<input type="file" accept="image/*" @change="onUploadBg" />
				</div>
				<div class="row"><button class="btn" @click="addText">添加文字</button></div>
				<div class="row"><button class="btn" @click="addVText">添加竖排文字</button></div>
				<label class="row"><span>头像外框</span>
					<select v-model="state.avatarFrame" @change="addFrameToExistingAvatar">
						<option value="none">无外框</option>
						<option value="circle">圆形外框</option>
						<option value="square">方形外框</option>
						<option value="flower">花朵外框</option>
						<option value="star">星形外框</option>
						<option value="heart">心形外框</option>
						<option value="diamond">菱形外框</option>
					</select>
				</label>
				<div class="row"><button class="btn" @click="addAvatar">上传头像</button></div>
				<div class="assets">
					<div class="group">素材</div>
					<div class="list">
						<button class="chip" @click="addImage('moon.png')">moon.png</button>
						<button class="chip" @click="addImage('lamp.png')">lamp.png</button>
						<button class="chip" @click="addImage('rabbit1.png')">rabbit1.png</button>
						<button class="chip" @click="addImage('rabbit2.png')">rabbit2.png</button>
						<button class="chip" @click="addImage('wicker.png')">wicker.png</button>
					</div>
				</div>
				<div class="panel">
					<div class="group">模板</div>
					<div class="list">
						<button class="chip" @click="applyTemplate('moon-celebrate')">月光庆祝</button>
						<button class="chip" @click="applyTemplate('rabbit-lamp')">玉兔灯笼</button>
						<button class="chip" @click="applyTemplate('minimal-title')">简约标题</button>
					</div>
				</div>
				<div class="panel layers" v-if="state.layers.length">
					<div class="group">图层</div>
					<ul>
						<li v-for="(l,i) in state.layers" :key="i" :class="{ active: state.selected===l.ref }" @click="selectLayer(i)">
							<input :value="l.name" @change="(e)=>renameLayer(i,e)" />
							<div class="ops">
								<button class="chip" @click.stop="moveLayer(i,'up')">上移</button>
								<button class="chip" @click.stop="moveLayer(i,'down')">下移</button>
								<button class="chip" @click.stop="toggleVisible(i)">{{ l.visible ? '隐藏' : '显示' }}</button>
								<button class="chip" @click.stop="toggleLock(i)">{{ l.locked ? '解锁' : '锁定' }}</button>
							</div>
						</li>
					</ul>
				</div>
				<div class="row ops">
					<button class="btn" @click="bringToFront">置顶</button>
					<button class="btn" @click="sendToBack">置底</button>
					<button class="btn" @click="deleteObject">删除</button>
				</div>
				<div class="panel" v-if="state.selected" @change="applyInspector" @input="applyInspector">
					<div class="group">属性</div>
					<label class="row"><span>文本</span><input v-model="state.inspector.text" @focus="syncInspector" /></label>
					<label class="row"><span>颜色</span><input type="color" v-model="state.inspector.fill" @focus="syncInspector" /></label>
					<label class="row"><span>字号</span><input type="range" min="12" max="120" step="1" v-model.number="state.inspector.fontSize" @focus="syncInspector" /></label>
					<label class="row"><span>描边色</span><input type="color" v-model="state.inspector.stroke" @focus="syncInspector" /></label>
					<label class="row"><span>描边宽</span><input type="range" min="0" max="8" step="1" v-model.number="state.inspector.strokeWidth" @focus="syncInspector" /></label>
					<label class="row"><span>不透明</span><input type="range" min="0" max="1" step="0.05" v-model.number="state.inspector.opacity" @focus="syncInspector" /></label>
					<label class="row"><span>角度</span><input type="range" min="-180" max="180" step="1" v-model.number="state.inspector.angle" @focus="syncInspector" /></label>
					<label class="row"><span>缩放</span><input type="range" min="0.2" max="3" step="0.05" v-model.number="state.inspector.scale" @focus="syncInspector" /></label>
					<label class="row"><span>阴影</span><input type="checkbox" v-model="state.inspector.shadow" @focus="syncInspector" /></label>
				</div>
				<button class="btn primary" @click="download">下载成品</button>
			</div>
		</div>
	</section>
</template>

<style scoped>
.card-pro { 
	background: #fff; 
	border: 1px solid #ffd3d3; 
	border-radius: 12px; 
	padding: 16px; 
	color: #7a0000; 
	min-height: 100vh;
}

.layout { 
	display: grid; 
	grid-template-columns: 1fr; 
	gap: 16px; 
	width: 100%;
	margin: 0 auto;
}

@media (min-width: 1200px) { 
	.layout { 
		grid-template-columns: minmax(0, 1fr) minmax(280px, 420px); 
		gap: 24px;
		width: 100%;
	} 
}

.stage { 
    width: 100%; 
    display: grid; 
    place-items: center; 
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-width: 0; /* 防止内部canvas宽度参与布局撑开 */
}

canvas { 
    width: 100%; 
    height: auto; 
    border-radius: 12px; 
    box-shadow: 0 8px 24px rgba(0,0,0,.1); 
    background: #faf7ef; 
}

.tools { 
	display: grid; 
	gap: 12px; 
	align-content: start; 
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	height: fit-content;
	min-width: 0; /* 防止内容撑破 */
	max-width: 100%;
}

.row { 
	display: flex; 
	align-items: center; 
	justify-content: space-between; 
	gap: 12px; 
	padding: 8px 0;
}

.assets { 
	border: 1px dashed #ffbcbc; 
	padding: 12px; 
	border-radius: 10px; 
	background: #fff9f9;
}

.group { 
	font-weight: 600; 
	margin-bottom: 8px; 
	color: #7a0000;
	font-size: 14px;
}

.list { 
	display: flex; 
	flex-wrap: wrap; 
	gap: 8px; 
}

.chip { 
	padding: 8px 12px; 
	background: #fff5f5; 
	border: 1px solid #ffbcbc; 
	border-radius: 20px; 
	color: #7a0000; 
	font-size: 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.chip:hover {
	background: #ffd700;
	border-color: #ffd700;
	transform: translateY(-1px);
}

.panel.layers ul { 
	list-style: none; 
	padding: 0; 
	margin: 0; 
	display: grid; 
	gap: 8px; 
}

.panel.layers li { 
	padding: 10px; 
	border: 1px solid #ffbcbc; 
	border-radius: 8px; 
	background: #fff; 
	display: grid; 
	gap: 8px; 
	cursor: pointer;
	transition: all 0.2s;
}

.panel.layers li:hover {
	border-color: #ffd700;
	box-shadow: 0 2px 4px rgba(255,215,0,0.2);
}

.panel.layers li.active { 
	outline: 2px solid #ffd700; 
	background: #fff9f9;
}

.panel.layers .ops { 
	display: flex; 
	gap: 6px; 
	flex-wrap: wrap;
}

.btn { 
	background: rgba(179,0,0,0.08); 
	color: #7a0000; 
	padding: 10px 16px; 
	border-radius: 8px; 
	text-decoration: none; 
	border: 1px solid #ffbcbc; 
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
	flex: 1;
}

.btn:hover {
	background: rgba(179,0,0,0.15);
	transform: translateY(-1px);
}

.btn.primary { 
	background: #ffd700; 
	color: #7a0000; 
	border: none; 
	font-weight: 600;
}

.btn.primary:hover {
	background: #ffed4e;
}

.ops { 
	display: flex; 
	gap: 8px; 
}

.inspector { 
	border: 1px solid #ffbcbc; 
	padding: 16px; 
	border-radius: 10px; 
	background: #fff; 
	margin-top: 12px;
}

.inspector .row { 
	margin-bottom: 10px; 
}

.inspector input, .inspector select { 
	padding: 6px 10px; 
	border: 1px solid #ffbcbc; 
	border-radius: 6px; 
	font-size: 14px;
	width: 100%;
}

.inspector input:focus, .inspector select:focus {
	outline: none;
	border-color: #ffd700;
	box-shadow: 0 0 0 2px rgba(255,215,0,0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
	.layout {
		gap: 12px;
		padding: 0 12px;
	}
	
	.stage {
		padding: 12px;
		background: #f0f0f0;
	}
	
	.tools {
		order: -1;
		padding: 12px;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 1px 4px rgba(0,0,0,0.1);
	}
	
	.row {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
	}
	
	.btn {
		width: 100%;
		padding: 12px 16px;
		font-size: 14px;
	}
	
	.chip {
		font-size: 11px;
		padding: 6px 10px;
		flex: 1;
		min-width: 0;
	}
	
	.inspector {
		padding: 12px;
	}
	
	/* 移动端画布尺寸调整 */
	canvas {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}
	
	/* 工具面板在移动端更紧凑 */
	.tools .group {
		font-size: 13px;
		margin-bottom: 6px;
	}
	
	.tools .list {
		gap: 6px;
	}
	
	/* 图层面板在移动端优化 */
	.panel.layers li {
		padding: 8px;
	}
	
	.panel.layers .ops {
		gap: 4px;
	}
	
	.panel.layers .ops .chip {
		font-size: 10px;
		padding: 4px 6px;
	}
}

@media (max-width: 480px) {
	.layout {
		gap: 8px;
		padding: 0 8px;
	}
	
	.stage {
		padding: 8px;
		background: #f5f5f5;
	}
	
	.tools {
		padding: 10px;
		border-radius: 6px;
	}
	
	.group {
		font-size: 12px;
		margin-bottom: 4px;
	}
	
	.chip {
		font-size: 10px;
		padding: 5px 8px;
	}
	
	.btn {
		padding: 10px 12px;
		font-size: 13px;
	}
	
	/* 超小屏幕画布优化 */
	canvas {
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}
	
	/* 图层面板超小屏幕优化 */
	.panel.layers li {
		padding: 6px;
	}
	
	.panel.layers .ops .chip {
		font-size: 9px;
		padding: 3px 5px;
	}
	
	.inspector {
		padding: 10px;
	}
	
	.inspector input, .inspector select {
		padding: 4px 8px;
		font-size: 13px;
	}
}
</style>

