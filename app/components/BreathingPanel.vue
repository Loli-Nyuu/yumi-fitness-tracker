<template>
  <Transition name="panel">
    <div v-if="showBreathingPanel" class="fixed inset-0 z-50 flex justify-end" @click.self="closeBreathingPanel">
      <div class="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col" style="background: var(--surface); border-left: 1px solid var(--border)">
        <!-- Close button -->
        <div class="flex justify-end mb-4">
          <button @click="closeBreathingPanel" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style="background: var(--surface-light); color: var(--text-muted)">
            <Icon :name="icons.close" />
          </button>
        </div>

        <!-- COUNTDOWN: Waiting to auto-start -->
        <div v-if="!activeBreathing && countdownSeconds > 0" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon :name="icons.breathing" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">{{ selectedPattern?.name }}</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">{{ selectedPattern?.helps }}</p>

          <p class="text-6xl font-mono font-bold mb-4" style="color: var(--primary)">{{ countdownSeconds }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Starting automatically...</p>

          <button @click="cancelCountdown" class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
            <Icon :name="icons.stop" /> Cancel
          </button>
        </div>

        <!-- NOT STARTED: Pattern detail -->
        <div v-else-if="!activeBreathing" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon :name="icons.breathing" class="text-5xl mb-4" style="color: var(--primary)" />
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
            class="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon :name="icons.start" /> Start
          </button>
        </div>

        <!-- STARTED: Visual guide -->
        <div v-else-if="!isPaused" class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Motivation message overlay -->
          <div v-if="motivationMsg" class="mb-4 px-4 py-2 rounded-xl animate-bounce"
            style="background: color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary)">
            <p class="text-sm font-medium">{{ motivationMsg }}</p>
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
              <Icon :name="icons.pause" /> {{ isPaused ? 'Resume' : 'Pause' }}
            </button>
            <button @click="stopBreathing"
              class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
              :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
              <Icon :name="icons.stop" /> Stop
            </button>
          </div>
        </div>

        <!-- PAUSED: Countdown overlay -->
        <div v-else-if="isPaused && resumeCountdown > 0" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon :name="icons.breathing" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">Paused</h3>
          <p class="text-6xl font-mono font-bold my-6" style="color: var(--primary)">{{ resumeCountdown }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Resuming automatically...</p>
          <button @click="cancelCountdown(); isPaused = false"
            class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
            <Icon :name="icons.play" /> Resume Now
          </button>
        </div>

        <!-- PAUSED: Waiting state -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon :name="icons.breathing" class="text-5xl mb-4" style="color: var(--primary); opacity: 0.5" />
          <h3 class="text-xl font-bold mb-2" style="color: var(--primary)">Paused</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Take your time</p>
          <button @click="togglePause"
            class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon :name="icons.play" /> Resume
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'
import { useBreathingPanel } from '~/composables/useBreathingPanel'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
  window.addEventListener('theme-change', ((e: CustomEvent) => { currentTheme.value = e.detail.theme }) as EventListener)
})

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
  breathPhase,
  breathTimer,
  breathRounds,
  breathElapsed,
  autoStartDelay,
  countdownSeconds,
  motivationMsg,
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
