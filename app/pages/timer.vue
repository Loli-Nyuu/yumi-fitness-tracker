<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">⏱️ Workout Timer</h1>

    <div class="bg-card p-10 text-center" :class="{ 'timer-active': isRunning }">
      <div class="text-7xl font-mono font-bold mb-4" :style="{ color: isRunning ? 'var(--primary)' : 'var(--text)' }">
        {{ formatTime(currentTime) }}
      </div>
      <p style="color: var(--text-muted)">{{ currentMode }}</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button v-for="mode in modes" :key="mode.id" @click="setMode(mode)"
        class="p-4 rounded-xl text-center transition-all"
        :style="activeMode === mode.id ? { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)', boxShadow: '0 0 15px var(--glow)', borderRadius: 'var(--radius)' } : { background: 'var(--surface)', borderRadius: 'var(--radius)' }">
        <div class="text-2xl mb-1">{{ mode.icon }}</div>
        <p class="font-semibold text-sm">{{ mode.name }}</p>
      </button>
    </div>

    <div v-if="activeMode === 'custom'" class="bg-card p-6">
      <h3 class="font-semibold mb-3">Custom Interval</h3>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Work (sec)</label>
          <input v-model.number="customWork" type="number" placeholder="30" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Rest (sec)</label>
          <input v-model.number="customRest" type="number" placeholder="15" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Rounds</label>
          <input v-model.number="customRounds" type="number" placeholder="3" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <button @click="startTimer" :disabled="isRunning" class="py-4 font-bold text-lg rounded-xl transition-all disabled:opacity-30" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">▶️ Start</button>
      <button @click="pauseTimer" :disabled="!isRunning" class="py-4 font-bold text-lg rounded-xl transition-all disabled:opacity-30" :style="{ background: 'color-mix(in srgb, var(--warning) 20%, transparent)', color: 'var(--warning)', borderRadius: 'var(--radius)' }">⏸️ Pause</button>
      <button @click="resetTimer" class="py-4 font-bold text-lg rounded-xl transition-all" :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)', borderRadius: 'var(--radius)' }">🔄 Reset</button>
    </div>

    <div v-if="totalRounds > 1" class="bg-card p-4 text-center">
      <p style="color: var(--text-muted)">Round</p>
      <p class="text-4xl font-bold" style="color: var(--primary)">{{ currentRound }} <span class="text-xl" style="color: var(--text-muted)">/ {{ totalRounds }}</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
const modes = [
  { id: 'stopwatch', name: 'Stopwatch', icon: '⏱️', type: 'up' },
  { id: 'wall-sit', name: 'Wall Sit', icon: '🧱', type: 'up' },
  { id: 'plank', name: 'Plank', icon: '💪', type: 'up' },
  { id: 'hold', name: 'Hold Timer', icon: '🍑', type: 'up' },
  { id: 'interval-30', name: '30s Interval', icon: '🔄', type: 'interval', work: 30, rest: 15, rounds: 3 },
  { id: 'hiit-20', name: 'HIIT 20/10', icon: '🔥', type: 'interval', work: 20, rest: 10, rounds: 8 },
  { id: 'countdown', name: 'Countdown', icon: '⏳', type: 'down', duration: 60 },
  { id: 'custom', name: 'Custom', icon: '⚙️', type: 'custom' },
]

const activeMode = ref('stopwatch')
const currentMode = ref('Stopwatch')
const currentTime = ref(0)
const isRunning = ref(false)
const currentRound = ref(1)
const totalRounds = ref(1)
const isWorkPhase = ref(true)
const customWork = ref(30)
const customRest = ref(15)
const customRounds = ref(3)
let timerInterval: ReturnType<typeof setInterval> | null = null

function setMode(mode: any) {
  stopTimer(); activeMode.value = mode.id; currentMode.value = mode.name; currentTime.value = 0; currentRound.value = 1
  if (mode.type === 'interval') { totalRounds.value = mode.rounds; currentTime.value = mode.work }
  else if (mode.type === 'down') { currentTime.value = mode.duration; totalRounds.value = 1 }
  else { totalRounds.value = 1 }
}

function startTimer() {
  if (isRunning.value) return; isRunning.value = true
  const mode = modes.find(m => m.id === activeMode.value)
  timerInterval = setInterval(() => {
    if (mode?.type === 'up' || mode?.type === 'stopwatch') { currentTime.value++ }
    else if (mode?.type === 'down') { currentTime.value--; if (currentTime.value <= 0) { playBeep(); stopTimer() } }
    else if (mode?.type === 'interval' || (mode?.type === 'custom' && activeMode.value === 'custom')) {
      const workTime = mode.type === 'custom' ? customWork.value : mode.work
      const restTime = mode.type === 'custom' ? customRest.value : mode.rest
      const rounds = mode.type === 'custom' ? customRounds.value : mode.rounds
      currentTime.value--
      if (currentTime.value <= 0) {
        playBeep()
        if (isWorkPhase.value) { isWorkPhase.value = false; currentTime.value = restTime; currentMode.value = 'Rest 😌' }
        else { currentRound.value++; if (currentRound.value > rounds) { stopTimer(); currentMode.value = 'Done! 🎉'; return }; isWorkPhase.value = true; currentTime.value = workTime; currentMode.value = 'Work! 💪' }
      }
    }
  }, 1000)
}

function pauseTimer() { isRunning.value = false; if (timerInterval) { clearInterval(timerInterval); timerInterval = null } }
function stopTimer() { isRunning.value = false; if (timerInterval) { clearInterval(timerInterval); timerInterval = null } }
function resetTimer() {
  stopTimer(); const mode = modes.find(m => m.id === activeMode.value)
  if (mode?.type === 'down') currentTime.value = mode.duration
  else if (mode?.type === 'interval') currentTime.value = mode.work
  else currentTime.value = 0
  currentRound.value = 1; isWorkPhase.value = true; currentMode.value = mode?.name || 'Stopwatch'
}

function formatTime(seconds: number) { const abs = Math.abs(seconds); const m = Math.floor(abs / 60); const s = abs % 60; return `${seconds < 0 ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }
function playBeep() { try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 800; gain.gain.value = 0.3; osc.start(); osc.stop(ctx.currentTime + 0.2) } catch {} }

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
</script>
