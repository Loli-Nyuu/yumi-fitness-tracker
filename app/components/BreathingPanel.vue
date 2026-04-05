<template>
  <Transition name="panel">
    <div v-if="showBreathingPanel" class="fixed inset-0 z-50 flex justify-end" @click.self="closeBreathingPanel">
      <div class="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col bg-surface-container-lowest border-l-2 border-tertiary-container/30 shadow-2xl rounded-l-3xl">
        <!-- Close button -->
        <div class="flex justify-end mb-4">
          <button @click="closeBreathingPanel" class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-90"
            style="background: var(--surface-light); color: var(--text-muted)">
            <Icon name="material-symbols:close-rounded" />
          </button>
        </div>

        <!-- COUNTDOWN: Waiting to auto-start -->
        <div v-if="!activeBreathing && countdownSeconds > 0" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon name="material-symbols:air" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">{{ selectedPattern?.name }}</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">{{ selectedPattern?.helps }}</p>

          <p class="text-6xl font-mono font-bold mb-4" style="color: var(--primary)">{{ countdownSeconds }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Starting automatically...</p>

          <button @click="cancelCountdown" class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
            <Icon name="material-symbols:front-hand-outline-rounded" /> Cancel
          </button>
        </div>

        <!-- NOT STARTED: Pattern detail -->
        <div v-else-if="!activeBreathing" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon name="material-symbols:air" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">{{ selectedPattern?.name }}</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">{{ selectedPattern?.helps }}</p>
          <div class="w-full p-4 rounded-xl mb-6" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text)">{{ selectedPattern?.instructions }}</p>
          </div>

          <!-- Round presets -->
          <p class="text-xs mb-2" style="color: var(--text-muted)">Repeat for</p>
          <div class="flex flex-wrap gap-2 mb-3 justify-center">
            <button v-for="opt in roundOptions" :key="opt.value" @click="selectedRounds = opt.value; customRounds = ''"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              :style="selectedRounds === opt.value && !customRounds
                ? { background: 'var(--primary)', color: 'var(--background)' }
                : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              {{ opt.label }}
            </button>
          </div>

          <!-- Custom rounds input -->
          <div class="flex items-center gap-2 mb-6">
            <input v-model="customRounds" type="number" min="1" placeholder="Custom"
              class="w-20 px-3 py-1.5 rounded-lg text-sm font-medium text-center"
              style="background: var(--surface-light); color: var(--text)"
              @input="const val = parseInt(customRounds); if (val > 0) selectedRounds = val" />
            <span class="text-sm" style="color: var(--text-muted)">rounds</span>
          </div>

          <button @click="startBreathingSession"
            class="px-8 py-3 rounded-full font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            style="background: linear-gradient(135deg, #ff6ea9 0%, #b30065 100%); color: white; border-radius: 9999px; box-shadow: 0 4px 12px rgba(179, 0, 101, 0.3);">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">play_circle</span> Start Session
          </button>
        </div>

        <!-- STARTED: Visual guide -->
        <div v-else-if="!isPaused && !sessionComplete" class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Motivation message overlay -->
          <div v-if="motivationMsg" class="mb-4 px-4 py-2 rounded-xl"
            style="background: color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary)">
            <p class="text-sm font-medium">{{ motivationMsg }}</p>
          </div>

          <!-- Message history (last 3 messages, excluding current) -->
          <div v-if="motivationHistory.length > 1" class="mb-4 w-full max-w-xs space-y-1">
            <div v-for="(msg, idx) in motivationHistory.slice(1).reverse()" :key="idx" 
              class="text-xs p-2 rounded transition-all"
              :style="{
                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                color: 'var(--text-muted)',
                opacity: 0.4 + ((motivationHistory.length - 2 - idx) / Math.max(1, motivationHistory.length - 2)) * 0.4,
              }">
              {{ msg }}
            </div>
          </div>

          <!-- Lung circle animation -->
          <div class="relative w-40 h-40 mb-6 flex items-center justify-center">
            <!-- Outer ring -->
            <div class="absolute inset-0 rounded-full" style="border: 2px solid var(--border)"></div>
            <!-- Animated lung circle -->
            <div class="rounded-full flex items-center justify-center"
              :style="{
                width: breathCircleSize + '%',
                height: breathCircleSize + '%',
                background: breathCircleBg,
                opacity: breathCircleOpacity,
                transition: breathCircleTransition,
              }">
              <span v-if="breathPhase === 'hold1' || breathPhase === 'hold2'" class="text-xs font-bold" style="color: var(--background)">Hold</span>
            </div>
          </div>

          <!-- Phase label with nose/mouth indicator -->
          <div class="flex items-center gap-2 mb-1 justify-center">
            <p class="text-3xl font-bold capitalize" style="color: var(--primary)">{{ breathPhaseLabel }}</p>
            <span v-if="breathRouteIndicator" class="text-lg px-2 py-0.5 rounded-full font-medium"
              :style="{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }">
              {{ breathRouteIndicator === 'nose' ? '👃' : '👄' }} {{ breathRouteIndicator }}
            </span>
          </div>
          <p class="text-5xl font-mono font-bold mb-2">{{ breathTimer }}</p>

          <!-- Progress -->
          <div class="flex items-center gap-3 mb-6">
            <span class="text-sm" style="color: var(--text-muted)">
              Round {{ breathRounds }}{{ selectedRounds > 0 ? '/' + selectedRounds : '' }}
            </span>
            <span class="text-sm" style="color: var(--text-muted)">·</span>
            <span class="text-sm" style="color: var(--text-muted)">{{ formatDuration(breathElapsed) }}</span>
          </div>

          <!-- Pause/Resume controls -->
          <div class="flex gap-3 mb-4">
            <button @click="togglePause"
              class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
              :style="{ background: 'color-mix(in srgb, var(--warning) 20%, transparent)', color: 'var(--warning)' }">
              <Icon name="material-symbols:pause-circle-outline-rounded" /> {{ isPaused ? 'Resume' : 'Pause' }}
            </button>
            <button @click="stopBreathing"
              class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
              :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
              <Icon name="material-symbols:stop-circle-outline-rounded" /> Stop
            </button>
          </div>
        </div>

        <!-- SESSION COMPLETE: Celebration screen -->
        <div v-else-if="sessionComplete" class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Celebration animation -->
          <div class="mb-6">
            <div class="text-6xl animate-bounce">🍑</div>
            <div class="text-4xl mt-2 animate-pulse">✨ 💪 ✨</div>
          </div>
          
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Session Complete!</h3>
          <p class="text-lg mb-4" style="color: var(--text)">{{ completionMessage }}</p>
          
          <!-- Stats -->
          <div class="mb-6 p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text-muted)">You completed</p>
            <p class="text-3xl font-bold" style="color: var(--primary)">{{ breathRounds - 1 }} rounds</p>
            <p class="text-sm" style="color: var(--text-muted)">of {{ selectedPattern?.name }}</p>
            <p class="text-xs mt-2" style="color: var(--text-muted)">{{ formatDuration(breathElapsed) }} total</p>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-col gap-3 w-full max-w-xs">
            <button @click="closeBreathingPanel"
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              :style="{ background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              Close
            </button>
            <button @click="resetForNewSession"
              class="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              :style="{ background: 'var(--primary)', color: 'var(--background)' }">
              <Icon name="material-symbols:autoplay-rounded" /> New Session
            </button>
          </div>
        </div>

        <!-- PAUSED: Countdown overlay -->
        <div v-else-if="isPaused && resumeCountdown > 0" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon name="material-symbols:air" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">Paused</h3>
          <p class="text-6xl font-mono font-bold my-6" style="color: var(--primary)">{{ resumeCountdown }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Resuming automatically...</p>
          <button @click="cancelCountdown(); isPaused = false"
            class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
            <Icon name="material-symbols:play-circle-outline-rounded" /> Resume Now
          </button>
        </div>

        <!-- PAUSED: Waiting state -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon name="material-symbols:air" class="text-5xl mb-4" style="color: var(--primary); opacity: 0.5" />
          <h3 class="text-xl font-bold mb-2" style="color: var(--primary)">Paused</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Take your time</p>
          <button @click="togglePause"
            class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon name="material-symbols:play-circle-outline-rounded" /> Resume
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useBreathingPanel } from '~/composables/useBreathingPanel'

function formatDuration(seconds: number) {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const {
  showBreathingPanel,
  selectedPattern,
  selectedRounds,
  customRounds,
  activeBreathing,
  sessionComplete,
  completionMessage,
  breathPhase,
  breathTimer,
  breathRounds,
  breathElapsed,
  autoStartDelay,
  countdownSeconds,
  motivationMsg,
  motivationHistory,
  breathCircleSize,
  breathCircleTransition,
  breathCircleBg,
  breathCircleOpacity,
  breathPhaseLabel,
  breathRouteIndicator,
  roundOptions,
  closeBreathingPanel,
  startBreathingSession,
  stopBreathing,
  cancelCountdown,
  pauseBreathing,
  resumeBreathing,
  sendProgress,
} = useBreathingPanel()

// Pause state
const isPaused = ref(false)
const resumeCountdown = ref(0)
let resumeInterval: ReturnType<typeof setInterval> | null = null

function resetForNewSession() {
  // Close current session and go back to pattern selection
  closeBreathingPanel()
}

function togglePause() {
  if (isPaused.value) {
    // Start resume countdown
    resumeCountdown.value = 3
    resumeInterval = setInterval(() => {
      resumeCountdown.value--
      if (resumeCountdown.value <= 0) {
        if (resumeInterval) clearInterval(resumeInterval)
        resumeInterval = null
        isPaused.value = false
        resumeBreathing()
      }
    }, 1000)
  } else {
    // Pause
    isPaused.value = true
    pauseBreathing()
  }
}
</script>

<style scoped>
.panel-enter-active, .panel-leave-active { transition: all 0.3s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from > div, .panel-leave-to > div { transform: translateX(100%); }
</style>
