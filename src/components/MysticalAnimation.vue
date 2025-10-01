<template>
  <div class="mystical-animation" :class="{ 'dark-mode': isDarkMode }">
    <!-- 卦象动画 -->
    <div v-if="showHexagramAnimation" class="hexagram-animation">
      <div class="animation-overlay">
        <div class="mystical-symbols">
          <div class="symbol symbol-1">☯</div>
          <div class="symbol symbol-2">☸</div>
          <div class="symbol symbol-3">☮</div>
          <div class="symbol symbol-4">☪</div>
        </div>
        
        <div class="hexagram-display">
          <div class="hexagram-title">{{ currentHexagram.name }}</div>
          <div class="hexagram-symbol">{{ currentHexagram.symbol }}</div>
          <div class="hexagram-lines">
            <div 
              v-for="(line, index) in currentHexagram.lines" 
              :key="index"
              :class="['hexagram-line', { 'yang': line === 1, 'yin': line === 0 }]"
            ></div>
          </div>
          <div class="hexagram-meaning">{{ currentHexagram.meaning }}</div>
        </div>
        
        <div class="animation-text">
          <div class="text-line">{{ animationText }}</div>
        </div>
      </div>
    </div>

    <!-- 塔罗牌抽卡动画 -->
    <div v-if="showTarotAnimation" class="tarot-animation">
      <div class="animation-overlay">
        <div class="card-deck">
          <div class="deck-back"></div>
          <div class="shuffling-cards">
            <div 
              v-for="i in 22" 
              :key="i"
              class="shuffle-card"
              :style="{ animationDelay: `${i * 0.1}s` }"
            ></div>
          </div>
        </div>
        
        <div class="drawn-cards">
          <div 
            v-for="(card, index) in drawnCards" 
            :key="index"
            class="drawn-card"
            :style="{ animationDelay: `${index * 0.5}s` }"
          >
            <div class="card-front">
              <div class="card-symbol">{{ card.symbol }}</div>
              <div class="card-name">{{ card.name }}</div>
            </div>
            <div class="card-back"></div>
          </div>
        </div>
        
        <div class="animation-text">
          <div class="text-line">{{ tarotAnimationText }}</div>
        </div>
      </div>
    </div>

    <!-- 星座运势动画 -->
    <div v-if="showZodiacAnimation" class="zodiac-animation">
      <div class="animation-overlay">
        <div class="zodiac-wheel">
          <div class="wheel-center">
            <div class="center-symbol">⭐</div>
          </div>
          <div class="zodiac-signs">
            <div 
              v-for="(sign, index) in zodiacSigns" 
              :key="sign.name"
              class="zodiac-sign"
              :style="{ 
                transform: `rotate(${index * 30}deg) translateY(-120px)`,
                animationDelay: `${index * 0.1}s`
              }"
            >
              <div class="sign-symbol">{{ sign.symbol }}</div>
              <div class="sign-name">{{ sign.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="zodiac-fortune-display">
          <div class="fortune-zodiac">
            <div class="zodiac-symbol-large">{{ currentZodiacFortune?.zodiac?.symbol }}</div>
            <div class="zodiac-name">{{ currentZodiacFortune?.zodiac?.name }}</div>
          </div>
          <div class="fortune-type">
            <div class="type-label">{{ currentZodiacFortune?.type?.name }}</div>
            <div class="level-indicator" :class="getLevelClass(currentZodiacFortune?.level?.key)">
              {{ currentZodiacFortune?.level?.name }}
            </div>
          </div>
        </div>
        
        <div class="animation-text">
          <div class="text-line">{{ zodiacAnimationText }}</div>
        </div>
      </div>
    </div>

    <!-- 投资五行动画 -->
    <div v-if="showInvestmentAnimation" class="investment-animation">
      <div class="animation-overlay">
        <div class="wuxing-circle">
          <div 
            v-for="(element, index) in wuxingElements" 
            :key="element.name"
            class="wuxing-element"
            :class="[`element-${element.id}`, { active: currentElement === element.id }]"
            :style="{ transform: `rotate(${index * 72}deg) translateY(-150px)` }"
          >
            <div class="element-symbol">{{ element.symbol }}</div>
            <div class="element-name">{{ element.name }}</div>
          </div>
        </div>
        
        <div class="investment-center">
          <div class="center-icon">💰</div>
          <div class="fortune-text">投资占卜</div>
          <div class="wuxing-text">五行轮转</div>
        </div>
        
        <div class="floating-symbols">
          <div class="floating-symbol symbol-1">☯️</div>
          <div class="floating-symbol symbol-2">🔮</div>
          <div class="floating-symbol symbol-3">✨</div>
          <div class="floating-symbol symbol-4">💎</div>
          <div class="floating-symbol symbol-5">🌟</div>
          <div class="floating-symbol symbol-6">📈</div>
        </div>
        
        <div class="animation-text">
          <div class="text-line">{{ investmentAnimationText }}</div>
        </div>
      </div>
    </div>

    <!-- 语音控制 -->
    <div class="voice-controls">
      <button 
        v-if="!isPlaying"
        @click="startVoiceReading" 
        class="voice-btn"
        :title="'语音解卦'"
      >
        <span class="voice-icon">🔊</span>
        语音解卦
      </button>
      <button 
        v-else
        @click="stopVoiceReading" 
        class="voice-btn stop"
        :title="'停止语音'"
      >
        <span class="voice-icon">⏹️</span>
        停止语音
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  },
  currentHexagram: {
    type: Object,
    default: () => ({})
  },
  drawnCards: {
    type: Array,
    default: () => []
  },
  showHexagramAnimation: {
    type: Boolean,
    default: false
  },
  showTarotAnimation: {
    type: Boolean,
    default: false
  },
  showZodiacAnimation: {
    type: Boolean,
    default: false
  },
  currentZodiacFortune: {
    type: Object,
    default: () => ({})
  },
  showInvestmentAnimation: {
    type: Boolean,
    default: false
  },
  currentInvestmentResult: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['animation-complete', 'voice-start', 'voice-stop', 'play-hexagram-sound', 'play-tarot-sound', 'play-zodiac-sound'])

// 响应式数据
const isPlaying = ref(false)
const animationText = ref('')
const tarotAnimationText = ref('')
const zodiacAnimationText = ref('')
const investmentAnimationText = ref('')
const currentElement = ref('wood')
const speechSynthesis = ref(null)
const currentUtterance = ref(null)

// 星座符号数据
const zodiacSigns = [
  { name: '白羊', symbol: '♈' },
  { name: '金牛', symbol: '♉' },
  { name: '双子', symbol: '♊' },
  { name: '巨蟹', symbol: '♋' },
  { name: '狮子', symbol: '♌' },
  { name: '处女', symbol: '♍' },
  { name: '天秤', symbol: '♎' },
  { name: '天蝎', symbol: '♏' },
  { name: '射手', symbol: '♐' },
  { name: '摩羯', symbol: '♑' },
  { name: '水瓶', symbol: '♒' },
  { name: '双鱼', symbol: '♓' }
]

// 五行元素数据
const wuxingElements = [
  { id: 'wood', name: '木', symbol: '🌳' },
  { id: 'fire', name: '火', symbol: '🔥' },
  { id: 'earth', name: '土', symbol: '🏔️' },
  { id: 'metal', name: '金', symbol: '⚡' },
  { id: 'water', name: '水', symbol: '💧' }
]

// 动画文本序列
const hexagramTexts = [
  '天地玄黄，宇宙洪荒...',
  '观天之道，执天之行...',
  '天行健，君子以自强不息...',
  '地势坤，君子以厚德载物...',
  '山重水复疑无路，柳暗花明又一村...',
  '卦象已现，玄机暗藏...'
]

const tarotTexts = [
  '洗牌中，连接神秘力量...',
  '塔罗牌在寻找答案...',
  '命运之轮开始转动...',
  '揭示隐藏的真相...',
  '牌阵已定，解读开始...'
]

const zodiacTexts = [
  '星空璀璨，命运之轮转动...',
  '星座能量正在汇聚...',
  '天象变化，运势显现...',
  '星辰指引，揭示未来...',
  '星座运势已定，解读开始...'
]

const investmentTexts = [
  '五行循环，财运推演...',
  '金木水火土，投资有道...',
  '五行相生相克，财富增减...',
  '天地之气，汇聚财运...',
  '五行平衡，投资圆满...'
]

// 初始化语音合成
onMounted(() => {
  if ('speechSynthesis' in window) {
    speechSynthesis.value = window.speechSynthesis
  }
})

onUnmounted(() => {
  if (currentUtterance.value) {
    speechSynthesis.value?.cancel()
  }
})

// 获取运势等级样式类
const getLevelClass = (levelKey) => {
  const levelClasses = {
    excellent: 'level-excellent',
    good: 'level-good',
    normal: 'level-normal',
    poor: 'level-poor',
    bad: 'level-bad'
  }
  return levelClasses[levelKey] || 'level-normal'
}

// 选择最佳语音
const selectBestVoice = () => {
  if (!speechSynthesis.value) return null
  
  const voices = speechSynthesis.value.getVoices()
  if (voices.length === 0) return null
  
  // 优先选择中文语音
  const chineseVoices = voices.filter(voice => 
    voice.lang.includes('zh') || voice.lang.includes('cmn')
  )
  
  if (chineseVoices.length > 0) {
    // 优先选择女性语音，听起来更温柔
    const femaleVoices = chineseVoices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('女') ||
      voice.name.toLowerCase().includes('xiaoxiao') ||
      voice.name.toLowerCase().includes('xiaoyi')
    )
    
    if (femaleVoices.length > 0) {
      return femaleVoices[0]
    }
    
    return chineseVoices[0]
  }
  
  // 如果没有中文语音，选择英语语音
  const englishVoices = voices.filter(voice => 
    voice.lang.includes('en')
  )
  
  if (englishVoices.length > 0) {
    return englishVoices[0]
  }
  
  // 最后选择任何可用的语音
  return voices[0]
}

// 开始语音解卦
const startVoiceReading = () => {
  if (!speechSynthesis.value) {
    alert('您的浏览器不支持语音功能')
    return
  }

  isPlaying.value = true
  emit('voice-start')

  const text = generateVoiceText()
  const utterance = new SpeechSynthesisUtterance(text)
  
  // 设置最佳语音
  const bestVoice = selectBestVoice()
  if (bestVoice) {
    utterance.voice = bestVoice
    console.log('使用语音:', bestVoice.name, bestVoice.lang)
  }
  
  // 优化语音参数
  utterance.lang = 'zh-CN'
  utterance.rate = 0.75  // 稍微慢一点，更清晰
  utterance.pitch = 1.05 // 稍微高一点，更悦耳
  utterance.volume = 0.95 // 音量稍大一点
  
  // 添加语音效果
  utterance.onstart = () => {
    console.log('开始语音播放')
  }
  
  utterance.onend = () => {
    isPlaying.value = false
    emit('voice-stop')
    console.log('语音播放结束')
  }

  utterance.onerror = (event) => {
    console.error('语音播放错误:', event.error)
    isPlaying.value = false
    emit('voice-stop')
  }

  currentUtterance.value = utterance
  speechSynthesis.value.speak(utterance)
}

// 停止语音
const stopVoiceReading = () => {
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel()
  }
  isPlaying.value = false
  emit('voice-stop')
}

// 生成语音文本
const generateVoiceText = () => {
  if (props.currentHexagram.name) {
    // 易经占卜语音解读 - 更神秘的语气
    const hexagram = props.currentHexagram
    let voiceText = `玄机显现，您得到的是${hexagram.name}卦。`
    
    // 添加卦象含义
    if (hexagram.meaning) {
      voiceText += `此卦象寓意深远，${hexagram.meaning}。`
    }
    
    // 添加卦象建议
    if (hexagram.advice) {
      voiceText += `卦象启示我们，${hexagram.advice}。`
    } else {
      voiceText += '卦象提醒我们，需要保持内心的平静，顺应自然规律。'
    }
    
    // 如果有卦象描述，也加入语音
    if (hexagram.description) {
      voiceText += `卦象描述：${hexagram.description}。`
    }
    
    voiceText += '愿您顺应天意，把握机遇。'
    return voiceText
  } else if (props.drawnCards.length > 0) {
    // 塔罗牌语音解读 - 更神秘的语调
    const cardNames = props.drawnCards.map(card => card.name).join('、')
    let voiceText = `命运之轮转动，塔罗牌为您揭示了：${cardNames}。`
    
    // 读取塔罗牌的详细解读
    const card = props.drawnCards[0]
    if (card.upright && card.upright.meaning) {
      voiceText += `这些神秘符号告诉我们，${card.upright.meaning}。`
    } else if (card.meaning) {
      voiceText += `这些神秘符号告诉我们，${card.meaning}。`
    } else {
      voiceText += '需要保持开放的心态，接受命运的指引。'
    }
    
    // 如果有塔罗牌的关键词，也加入语音
    if (card.keywords && card.keywords.length > 0) {
      const keywords = card.keywords.join('、')
      voiceText += `关键词包括：${keywords}。`
    }
    
    voiceText += '愿您听从内心的声音，找到属于自己的道路。'
    return voiceText
  } else if (props.currentZodiacFortune.zodiac) {
    // 星座运势语音解读 - 更温柔的语调
    const fortune = props.currentZodiacFortune
    let voiceText = `星辰指引，${fortune.zodiac.name}在${fortune.type.name}方面，运势等级为${fortune.level.name}。`
    
    // 添加运势内容
    if (fortune.content) {
      voiceText += `${fortune.content}。`
    }
    
    // 添加建议
    if (fortune.advice) {
      voiceText += `建议：${fortune.advice}。`
    }
    
    // 添加幸运信息
    if (fortune.zodiac.colors && fortune.zodiac.luckyNumbers) {
      voiceText += `幸运颜色：${fortune.zodiac.colors.join('、')}。幸运数字：${fortune.zodiac.luckyNumbers.join('、')}。`
    }
    
    return voiceText
  }
  return '占卜完成，请仔细解读结果。'
}

// 监听动画状态变化
const watchAnimation = () => {
  if (props.showHexagramAnimation) {
    // 播放卦象音效
    emit('play-hexagram-sound')
    
    let textIndex = 0
    const textInterval = setInterval(() => {
      if (textIndex < hexagramTexts.length) {
        animationText.value = hexagramTexts[textIndex]
        textIndex++
      } else {
        clearInterval(textInterval)
        setTimeout(() => {
          emit('animation-complete')
        }, 2000)
      }
    }, 1500)
  }

  if (props.showTarotAnimation) {
    // 播放塔罗牌音效
    emit('play-tarot-sound')
    
    let textIndex = 0
    const textInterval = setInterval(() => {
      if (textIndex < tarotTexts.length) {
        tarotAnimationText.value = tarotTexts[textIndex]
        textIndex++
      } else {
        clearInterval(textInterval)
        setTimeout(() => {
          emit('animation-complete')
        }, 2000)
      }
    }, 1200)
  }

  if (props.showZodiacAnimation) {
    // 播放星座音效
    emit('play-zodiac-sound')
    
    let textIndex = 0
    const textInterval = setInterval(() => {
      if (textIndex < zodiacTexts.length) {
        zodiacAnimationText.value = zodiacTexts[textIndex]
        textIndex++
      } else {
        clearInterval(textInterval)
        setTimeout(() => {
          emit('animation-complete')
        }, 2000)
      }
    }, 1300)
  }

  if (props.showInvestmentAnimation) {
    // 播放投资占卜音效
    emit('play-hexagram-sound')
    
    let textIndex = 0
    let elementIndex = 0
    
    // 文本动画
    const textInterval = setInterval(() => {
      if (textIndex < investmentTexts.length) {
        investmentAnimationText.value = investmentTexts[textIndex]
        textIndex++
      } else {
        clearInterval(textInterval)
        setTimeout(() => {
          emit('animation-complete')
        }, 2000)
      }
    }, 1200)
    
    // 五行轮转动画
    const elementInterval = setInterval(() => {
      const elements = ['wood', 'fire', 'earth', 'metal', 'water']
      currentElement.value = elements[elementIndex % elements.length]
      elementIndex++
    }, 800)
    
    // 动画结束后清理
    setTimeout(() => {
      clearInterval(elementInterval)
    }, investmentTexts.length * 1200 + 2000)
  }
}

// 监听属性变化
watch(() => [props.showHexagramAnimation, props.showTarotAnimation, props.showZodiacAnimation, props.showInvestmentAnimation], watchAnimation, { immediate: true })
</script>

<style scoped>
.mystical-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
}

.animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.dark-mode .animation-overlay {
  background: radial-gradient(circle, rgba(15, 15, 35, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
}

/* 神秘符号动画 */
.mystical-symbols {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.symbol {
  position: absolute;
  font-size: 3rem;
  color: rgba(255, 215, 0, 0.8);
  animation: float-symbol 4s ease-in-out infinite;
}

.symbol-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.symbol-2 {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.symbol-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.symbol-4 {
  top: 40%;
  right: 40%;
  animation-delay: 3s;
}

@keyframes float-symbol {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 卦象显示 */
.hexagram-display {
  text-align: center;
  color: #FFD700;
  z-index: 10;
}

.hexagram-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.hexagram-symbol {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.hexagram-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.hexagram-line {
  width: 60px;
  height: 8px;
  border-radius: 4px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;
}

.hexagram-line.yang {
  background: linear-gradient(90deg, #FFD700, #FFA500);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.hexagram-line.yin {
  background: linear-gradient(90deg, #4682B4, #87CEEB);
  box-shadow: 0 0 10px rgba(70, 130, 180, 0.5);
}

.hexagram-meaning {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 1rem auto;
  line-height: 1.6;
}

/* 塔罗牌动画 */
.card-deck {
  position: relative;
  width: 200px;
  height: 300px;
  margin-bottom: 2rem;
}

.deck-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #2c1810, #8b4513);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid #FFD700;
}

.shuffling-cards {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shuffle-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #2c1810, #8b4513);
  border-radius: 15px;
  border: 2px solid #FFD700;
  animation: shuffle 1s ease-in-out infinite;
}

@keyframes shuffle {
  0%, 100% {
    transform: translateX(0px) translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateX(10px) translateY(-5px) rotate(5deg);
  }
  50% {
    transform: translateX(-5px) translateY(10px) rotate(-3deg);
  }
  75% {
    transform: translateX(8px) translateY(-8px) rotate(2deg);
  }
}

.drawn-cards {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.drawn-card {
  width: 120px;
  height: 180px;
  position: relative;
  transform-style: preserve-3d;
  animation: flipCard 1s ease-in-out forwards;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-front {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  transform: rotateY(180deg);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.card-back {
  background: linear-gradient(45deg, #2c1810, #8b4513);
  border: 2px solid #FFD700;
}

.card-symbol {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.card-name {
  font-size: 0.8rem;
  text-align: center;
  font-weight: bold;
}

@keyframes flipCard {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}

/* 星座运势动画 */
.zodiac-wheel {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 2rem;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.center-symbol {
  font-size: 2.5rem;
  animation: spin 4s linear infinite;
}

.zodiac-signs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.zodiac-sign {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zodiacFloat 3s ease-in-out infinite;
}

.sign-symbol {
  font-size: 1.5rem;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  margin-bottom: 0.3rem;
}

.sign-name {
  font-size: 0.7rem;
  color: #FFD700;
  text-align: center;
  font-weight: 500;
}

@keyframes zodiacFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.zodiac-fortune-display {
  text-align: center;
  color: #FFD700;
  z-index: 10;
  margin-top: 2rem;
}

.fortune-zodiac {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.zodiac-symbol-large {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.zodiac-name {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.fortune-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.type-label {
  font-size: 1.5rem;
  font-weight: 500;
}

.level-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
}

.level-excellent {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.level-good {
  background: linear-gradient(135deg, #32CD32, #90EE90);
  color: #1a1a2e;
  box-shadow: 0 0 15px rgba(50, 205, 50, 0.5);
}

.level-normal {
  background: linear-gradient(135deg, #4682B4, #87CEEB);
  color: white;
  box-shadow: 0 0 15px rgba(70, 130, 180, 0.5);
}

.level-poor {
  background: linear-gradient(135deg, #FFA500, #FF8C00);
  color: white;
  box-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
}

.level-bad {
  background: linear-gradient(135deg, #DC143C, #FF6347);
  color: white;
  box-shadow: 0 0 15px rgba(220, 20, 60, 0.5);
}

/* 动画文本 */
.animation-text {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #FFD700;
  z-index: 10;
}

.text-line {
  font-size: 1.3rem;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: fadeInUp 0.5s ease-in-out;
}

/* 语音控制 */
.voice-controls {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1001;
  pointer-events: all;
}

.voice-btn {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #4682B4, #87CEEB);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(70, 130, 180, 0.3);
  transition: all 0.3s ease;
}

.voice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
}

.voice-btn.stop {
  background: linear-gradient(135deg, #dc3545, #ff6b6b);
}

.voice-btn.stop:hover {
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.voice-icon {
  font-size: 1.2rem;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 投资五行动画样式 */
.investment-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
}

.wuxing-circle {
  position: relative;
  width: 350px;
  height: 350px;
  border: 3px solid rgba(255, 152, 0, 0.5);
  border-radius: 50%;
  animation: rotate-circle 8s linear infinite;
}

.wuxing-element {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  border-radius: 50%;
  background: rgba(255, 152, 0, 0.2);
  border: 2px solid rgba(255, 152, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  animation: float 3s ease-in-out infinite;
}

.wuxing-element.active {
  background: rgba(255, 152, 0, 0.8);
  border-color: #ff9800;
  box-shadow: 0 0 30px rgba(255, 152, 0, 0.8);
  transform: scale(1.2);
}

.element-wood.active {
  background: rgba(76, 175, 80, 0.8);
  border-color: #4caf50;
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.8);
}

.element-fire.active {
  background: rgba(244, 67, 54, 0.8);
  border-color: #f44336;
  box-shadow: 0 0 30px rgba(244, 67, 54, 0.8);
}

.element-earth.active {
  background: rgba(121, 85, 72, 0.8);
  border-color: #795548;
  box-shadow: 0 0 30px rgba(121, 85, 72, 0.8);
}

.element-metal.active {
  background: rgba(158, 158, 158, 0.8);
  border-color: #9e9e9e;
  box-shadow: 0 0 30px rgba(158, 158, 158, 0.8);
}

.element-water.active {
  background: rgba(33, 150, 243, 0.8);
  border-color: #2196f3;
  box-shadow: 0 0 30px rgba(33, 150, 243, 0.8);
}

.element-symbol {
  font-size: 24px;
  margin-bottom: 5px;
}

.element-name {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.investment-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.center-icon {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: pulse 2s ease-in-out infinite;
}

.fortune-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff9800;
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.wuxing-text {
  font-size: 1rem;
  color: #fff;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.floating-symbols {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-symbol {
  position: absolute;
  font-size: 2rem;
  color: rgba(255, 152, 0, 0.7);
  animation: float-symbol 6s ease-in-out infinite;
}

.floating-symbol.symbol-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.floating-symbol.symbol-2 {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.floating-symbol.symbol-3 {
  bottom: 35%;
  left: 20%;
  animation-delay: 2s;
}

.floating-symbol.symbol-4 {
  bottom: 25%;
  right: 25%;
  animation-delay: 3s;
}

.floating-symbol.symbol-5 {
  top: 45%;
  left: 5%;
  animation-delay: 4s;
}

.floating-symbol.symbol-6 {
  top: 55%;
  right: 8%;
  animation-delay: 5s;
}

@keyframes rotate-circle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 投资动画深色模式 */
.mystical-animation.dark-mode .investment-center .fortune-text {
  color: #ffab00;
}

.mystical-animation.dark-mode .investment-center .wuxing-text {
  color: #e0e0e0;
}

.mystical-animation.dark-mode .wuxing-element {
  background: rgba(255, 152, 0, 0.15);
  border-color: rgba(255, 152, 0, 0.4);
}

.mystical-animation.dark-mode .wuxing-element.active {
  background: rgba(255, 152, 0, 0.6);
  border-color: #ff9800;
}

.mystical-animation.dark-mode .element-wood.active {
  background: rgba(76, 175, 80, 0.6);
  border-color: #4caf50;
}

.mystical-animation.dark-mode .element-fire.active {
  background: rgba(244, 67, 54, 0.6);
  border-color: #f44336;
}

.mystical-animation.dark-mode .element-earth.active {
  background: rgba(121, 85, 72, 0.6);
  border-color: #795548;
}

.mystical-animation.dark-mode .element-metal.active {
  background: rgba(158, 158, 158, 0.6);
  border-color: #9e9e9e;
}

.mystical-animation.dark-mode .element-water.active {
  background: rgba(33, 150, 243, 0.6);
  border-color: #2196f3;
}

.mystical-animation.dark-mode .wuxing-circle {
  border-color: rgba(255, 152, 0, 0.4);
}

.mystical-animation.dark-mode .floating-symbol {
  color: rgba(255, 152, 0, 0.5);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .hexagram-title {
    font-size: 2rem;
  }
  
  .hexagram-symbol {
    font-size: 3rem;
  }
  
  .hexagram-meaning {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  .drawn-cards {
    gap: 0.5rem;
  }
  
  .drawn-card {
    width: 100px;
    height: 150px;
  }
  
  .card-symbol {
    font-size: 1.5rem;
  }
  
  .card-name {
    font-size: 0.7rem;
  }
  
  .text-line {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  
  .voice-controls {
    bottom: 1rem;
    right: 1rem;
  }
  
  .voice-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .zodiac-wheel {
    width: 250px;
    height: 250px;
  }
  
  .wheel-center {
    width: 60px;
    height: 60px;
  }
  
  .center-symbol {
    font-size: 2rem;
  }
  
  .sign-symbol {
    font-size: 1.2rem;
  }
  
  .sign-name {
    font-size: 0.6rem;
  }
  
  .zodiac-symbol-large {
    font-size: 3rem;
  }
  
  .zodiac-name {
    font-size: 1.5rem;
  }
  
  .type-label {
    font-size: 1.2rem;
  }
  
  /* 投资动画移动端适配 */
  .wuxing-circle {
    width: 280px;
    height: 280px;
  }
  
  .wuxing-element {
    width: 70px;
    height: 70px;
    margin: -35px 0 0 -35px;
  }
  
  .element-symbol {
    font-size: 20px;
  }
  
  .element-name {
    font-size: 13px;
  }
  
  .center-icon {
    font-size: 3.5rem;
  }
  
  .fortune-text {
    font-size: 1.3rem;
  }
  
  .wuxing-text {
    font-size: 0.95rem;
  }
  
  .floating-symbol {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .hexagram-title {
    font-size: 1.8rem;
  }
  
  .hexagram-symbol {
    font-size: 2.5rem;
  }
  
  .drawn-card {
    width: 80px;
    height: 120px;
  }
  
  .card-symbol {
    font-size: 1.2rem;
  }
  
  .card-name {
    font-size: 0.6rem;
  }
  
  .text-line {
    font-size: 1rem;
  }
  
  .zodiac-wheel {
    width: 200px;
    height: 200px;
  }
  
  .wheel-center {
    width: 50px;
    height: 50px;
  }
  
  .center-symbol {
    font-size: 1.5rem;
  }
  
  .sign-symbol {
    font-size: 1rem;
  }
  
  .sign-name {
    font-size: 0.5rem;
  }
  
  .zodiac-symbol-large {
    font-size: 2.5rem;
  }
  
  .zodiac-name {
    font-size: 1.2rem;
  }
  
  .type-label {
    font-size: 1rem;
  }
  
  /* 投资动画超小屏适配 */
  .wuxing-circle {
    width: 220px;
    height: 220px;
  }
  
  .wuxing-element {
    width: 55px;
    height: 55px;
    margin: -27.5px 0 0 -27.5px;
  }
  
  .element-symbol {
    font-size: 16px;
  }
  
  .element-name {
    font-size: 11px;
  }
  
  .center-icon {
    font-size: 2.8rem;
  }
  
  .fortune-text {
    font-size: 1.1rem;
  }
  
  .wuxing-text {
    font-size: 0.85rem;
  }
  
  .floating-symbol {
    font-size: 1.3rem;
  }
}
</style> 