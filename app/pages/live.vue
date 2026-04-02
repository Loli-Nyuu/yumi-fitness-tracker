<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">🔴 Live Session</h1>

    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" :style="{ background: connected ? 'var(--success)' : 'var(--danger)' }" />
      <span class="text-sm" style="color: var(--text-muted)">{{ connected ? 'Connected' : 'Disconnected' }}</span>
    </div>

    <div v-if="!connected" class="bg-card p-8 text-center">
      <div class="text-6xl mb-4">🔌</div>
      <h2 class="text-xl font-semibold mb-2">Connecting to Coach...</h2>
      <p style="color: var(--text-muted)">Make sure the server is running</p>
      <button @click="connect" class="mt-4 px-6 py-2 font-semibold rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
        Retry Connection
      </button>
    </div>

    <div v-else class="space-y-4">
      <div v-if="sessionStatus === 'waiting'" class="bg-card p-8 text-center">
        <div class="text-6xl mb-4">🏋️</div>
        <h2 class="text-xl font-semibold mb-2">Ready to Train?</h2>
        <p class="mb-6" style="color: var(--text-muted)">Yumi is watching. Start when you're ready!</p>
        <button @click="startSession" class="px-8 py-3 font-bold text-lg rounded-xl transition-all glow-primary" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
          🔥 START SESSION
        </button>
      </div>

      <div v-else-if="sessionStatus === 'active'" class="space-y-4">
        <div class="bg-card p-8 text-center timer-active">
          <div class="text-6xl font-mono font-bold mb-2" style="color: var(--primary)">{{ formatTime(elapsedTime) }}</div>
          <p style="color: var(--text-muted)">{{ timerType || 'Ready' }}</p>
        </div>

        <div class="bg-card p-6 flex items-center justify-between">
          <div>
            <p class="text-sm" style="color: var(--text-muted)">Reps</p>
            <p class="text-3xl font-bold">{{ repCount }} <span class="text-lg" style="color: var(--text-muted)">/ {{ repTarget }}</span></p>
          </div>
          <div>
            <p class="text-sm" style="color: var(--text-muted)">Sets</p>
            <p class="text-3xl font-bold">{{ setCount }} <span class="text-lg" style="color: var(--text-muted)">/ {{ setTarget }}</span></p>
          </div>
          <button @click="completeRep" class="px-6 py-3 font-bold rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
            +1 Rep 🍑
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <button @click="startTimer('hold')" class="py-3 font-semibold rounded-xl transition-all" :style="{ background: 'var(--surface-light)', color: 'var(--text)', borderRadius: 'var(--radius)' }">⏱️ Hold Timer</button>
          <button @click="requestBreak" class="py-3 font-semibold rounded-xl transition-all" :style="{ background: 'color-mix(in srgb, var(--warning) 20%, transparent)', color: 'var(--warning)', borderRadius: 'var(--radius)' }">☕ Break</button>
          <button @click="requestModify" class="py-3 font-semibold rounded-xl transition-all" :style="{ background: 'color-mix(in srgb, var(--info) 20%, transparent)', color: 'var(--info)', borderRadius: 'var(--radius)' }">🔧 Modify</button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button @click="stopTimer" class="py-3 font-semibold rounded-xl transition-all" :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)', borderRadius: 'var(--radius)' }">⏹️ Stop Timer</button>
          <button @click="completeSet" class="py-3 font-semibold rounded-xl transition-all" :style="{ background: 'color-mix(in srgb, var(--success) 20%, transparent)', color: 'var(--success)', borderRadius: 'var(--radius)' }">✅ Complete Set</button>
        </div>

        <button @click="nextExercise" class="w-full py-3 font-semibold rounded-xl transition-all" :style="{ background: 'var(--surface-light)', color: 'var(--text)', borderRadius: 'var(--radius)' }">➡️ Next Exercise</button>
        <button @click="completeSession" class="w-full py-4 font-bold text-lg rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">🏆 COMPLETE SESSION</button>
      </div>

      <div v-else-if="sessionStatus === 'completed'" class="bg-card p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold mb-2 text-gradient">Session Complete!</h2>
        <p class="mb-6" style="color: var(--text-muted)">Amazing work, Yuyu! 🍑</p>
        <NuxtLink to="/" class="inline-block px-6 py-2 font-semibold rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">Back to Dashboard</NuxtLink>
      </div>
    </div>

    <div v-if="messages.length" class="bg-card p-4 max-h-40 overflow-y-auto">
      <p v-for="(msg, i) in messages" :key="i" class="text-sm py-1" style="color: var(--text-muted); border-bottom: 1px solid var(--border)">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const connected = ref(false)
const sessionStatus = ref<'waiting' | 'active' | 'paused' | 'completed'>('waiting')
const elapsedTime = ref(0)
const timerType = ref('')
const repCount = ref(0)
const repTarget = ref(12)
const setCount = ref(0)
const setTarget = ref(2)
const messages = ref<string[]>([])

let ws: WebSocket | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null

function connect() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${window.location.host}/_ws`)
  ws.onopen = () => { connected.value = true; ws?.send(JSON.stringify({ event: 'session:join', data: { sessionId: Date.now() } })) }
  ws.onmessage = (event) => { handleWSMessage(JSON.parse(event.data)) }
  ws.onclose = () => { connected.value = false; setTimeout(connect, 3000) }
}

function handleWSMessage(msg: any) {
  messages.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg.event}`)
  if (msg.event === 'timer:started') {
    if (timerInterval) clearInterval(timerInterval)
    elapsedTime.value = 0; timerType.value = msg.data.type
    timerInterval = setInterval(() => elapsedTime.value++, 1000)
  } else if (msg.event === 'timer:stopped') {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  }
}

function startSession() { sessionStatus.value = 'active'; ws?.send(JSON.stringify({ event: 'session:start', data: { sessionId: Date.now() } })) }
function startTimer(type: string) { ws?.send(JSON.stringify({ event: 'timer:start', data: { type } })) }
function stopTimer() { ws?.send(JSON.stringify({ event: 'timer:stop', data: {} })) }
function completeRep() { repCount.value++; ws?.send(JSON.stringify({ event: 'rep:complete', data: { target: repTarget.value } })) }
function completeSet() { setCount.value++; repCount.value = 0; ws?.send(JSON.stringify({ event: 'set:complete', data: { total: setTarget.value } })) }
function nextExercise() { repCount.value = 0; setCount.value = 0; ws?.send(JSON.stringify({ event: 'exercise:next', data: {} })) }
function requestBreak() { ws?.send(JSON.stringify({ event: 'break:request', data: { duration: 60 } })) }
function requestModify() { ws?.send(JSON.stringify({ event: 'modify:request', data: { reason: 'requested' } })) }
function completeSession() { sessionStatus.value = 'completed'; if (timerInterval) { clearInterval(timerInterval); timerInterval = null }; ws?.send(JSON.stringify({ event: 'session:complete', data: {} })) }
function formatTime(seconds: number) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` }

onMounted(() => connect())
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); ws?.close() })
</script>
