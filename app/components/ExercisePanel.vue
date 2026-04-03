<template>
  <Transition name="panel">
    <div v-if="showExercisePanel" class="fixed inset-0 z-50 flex justify-end" @click.self="closeExercisePanel">
      <div class="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col" style="background: var(--surface); border-left: 1px solid var(--border)">
        <!-- Close button -->
        <div class="flex justify-end mb-4">
          <button @click="closeExercisePanel" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style="background: var(--surface-light); color: var(--text-muted)">
            <Icon :name="icons.close" />
          </button>
        </div>

        <!-- EXERCISE DETAIL VIEW -->
        <div v-if="!isGuidedSession" class="flex-1 flex flex-col">
          <!-- GIF/Image -->
          <div v-if="selectedExercise?.gifUrl" class="mb-4 rounded-xl overflow-hidden aspect-video" :style="{ background: 'var(--surface-light)' }">
            <img :src="selectedExercise.gifUrl" :alt="selectedExercise.name" class="w-full h-full object-contain" />
          </div>
          <div v-else class="mb-4 rounded-xl aspect-video flex items-center justify-center text-6xl" :style="{ background: 'var(--surface-light)' }">
            {{ selectedExercise?.category === 'glutes' ? '🍑' : selectedExercise?.category === 'legs' ? '🦵' : '💪' }}
          </div>

          <h2 class="text-2xl font-bold mb-1" style="color: var(--primary)">{{ selectedExercise?.name }}</h2>
          <p class="text-sm mb-4" style="color: var(--text-muted)">{{ selectedExercise?.category }} · {{ selectedExercise?.musclePrimary }}</p>

          <div class="mb-4 p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text)">{{ selectedExercise?.description }}</p>
          </div>

          <div v-if="selectedExercise?.kidFriendlyTip" class="mb-4 p-3 rounded-xl" style="background: color-mix(in srgb, var(--primary) 10%, transparent)">
            <p class="text-sm italic" style="color: var(--primary)">{{ selectedExercise.kidFriendlyTip }}</p>
          </div>

          <button @click="startGuidedSession"
            class="mt-auto w-full py-3 rounded-xl font-semibold transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon :name="icons.start" /> Start Guided Session
          </button>
        </div>

        <!-- COUNTDOWN VIEW -->
        <div v-else-if="phase === 'countdown'" class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="text-6xl mb-4 animate-bounce">🍑</div>
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Get Ready!</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">{{ selectedExercise?.name }}</p>
          <p class="text-7xl font-mono font-bold" style="color: var(--primary)">{{ countdownValue }}</p>
        </div>

        <!-- ACTIVE EXERCISE VIEW -->
        <div v-else-if="phase === 'active'" class="flex-1 flex flex-col items-center justify-center text-center">
          <h3 class="text-xl font-bold mb-2" style="color: var(--primary)">{{ selectedExercise?.name }}</h3>
          
          <!-- Rep phase indicator -->
          <div v-if="currentRepPhase && phase === 'active'" class="mb-4">
            <div class="text-5xl mb-2 animate-bounce">{{ repPhaseEmoji }}</div>
            <p class="text-xl font-semibold" style="color: var(--primary)">{{ repPhaseLabel }}</p>
          </div>

          <!-- Timer / Rep counter -->
          <div class="mb-4">
            <p v-if="phase === 'active' && currentRepPhase" class="text-2xl mb-2" style="color: var(--text-muted)">
              Rep {{ currentRep }} / {{ 12 }}
            </p>
            <p class="text-6xl font-mono font-bold" style="color: var(--primary)">
              {{ phase === 'countdown' ? countdownValue : (currentCue || formatTime(timeRemaining)) }}
            </p>
          </div>

          <!-- Set indicator -->
          <p class="text-sm mb-4" style="color: var(--text-muted)">Set {{ currentSet }}</p>

          <!-- Current cue message -->
          <div v-if="currentCue" class="mb-6 p-4 rounded-xl animate-pulse" style="background: color-mix(in srgb, var(--primary) 15%, transparent)">
            <p class="text-sm font-medium" style="color: var(--primary)">{{ currentCue }}</p>
          </div>

          <!-- Pause/Stop buttons -->
          <div class="flex gap-3">
            <button @click="pauseExercise" class="px-4 py-2 rounded-xl text-sm font-medium" :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
              Pause
            </button>
            <button @click="stopExercise" class="px-4 py-2 rounded-xl text-sm font-medium" :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
              Stop
            </button>
          </div>
        </div>

        <!-- REST VIEW -->
        <div v-else-if="phase === 'rest'" class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="text-6xl mb-4 animate-pulse">💤</div>
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Rest Time!</h3>
          <p class="text-6xl font-mono font-bold my-4" style="color: var(--primary)">{{ formatTime(timeRemaining) }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Next set coming up...</p>
          <button @click="skipRest" class="px-6 py-2 rounded-xl text-sm font-medium" :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
            Skip Rest
          </button>
        </div>

        <!-- PAUSED VIEW -->
        <div v-else-if="isPaused" class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="text-6xl mb-4">⏸️</div>
          <h3 class="text-2xl font-bold mb-4" style="color: var(--primary)">Paused</h3>
          <div class="flex flex-col gap-3 w-full max-w-xs">
            <button @click="resumeExercise" class="px-6 py-3 rounded-xl font-semibold" :style="{ background: 'var(--primary)', color: 'var(--background)' }">
              Resume
            </button>
            <button @click="stopExercise" class="px-6 py-2 rounded-xl text-sm" :style="{ background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              End Session
            </button>
          </div>
        </div>

        <!-- COMPLETE VIEW -->
        <div v-else-if="phase === 'complete'" class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="mb-6">
            <div class="text-6xl animate-bounce">🍑</div>
            <div class="text-4xl mt-2 animate-pulse">✨ 💪 ✨</div>
          </div>
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Exercise Complete!</h3>
          <p class="text-lg mb-4" style="color: var(--text)">Amazing work, Yuyu!</p>
          <div class="mb-6 p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text-muted)">You completed</p>
            <p class="text-3xl font-bold" style="color: var(--primary)">{{ config?.sets || 3 }} sets</p>
            <p class="text-sm mt-1" style="color: var(--text-muted)">of {{ selectedExercise?.name }}</p>
          </div>
          <div class="flex flex-col gap-3 w-full max-w-xs">
            <button @click="closeExercisePanel" class="px-6 py-3 rounded-xl font-medium" :style="{ background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              Close
            </button>
            <button @click="resetAndClose" class="px-6 py-3 rounded-xl font-semibold" :style="{ background: 'var(--primary)', color: 'var(--background)' }">
              <Icon :name="icons.start" /> New Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'
import { useExercisePanel } from '~/composables/useExercisePanel'
import { useAutoExercise } from '~/composables/useAutoExercise'
import type { ExerciseConfig, RepsModeConfig, TimedModeConfig } from '~/types/exercise-config'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
})

// Use the exercise panel composable (shared state for show/hide)
const {
  showExercisePanel,
  selectedExercise,
  isGuidedSession,
  openExercisePanel: openPanel,
  closeExercisePanel: closePanel,
} = useExercisePanel()

// Use the auto-exercise engine (local state for exercise execution)
const {
  phase,
  currentRep,
  currentSet,
  currentRepPhase,
  timeRemaining,
  currentCue,
  isPaused,
  countdownValue,
  sessionComplete,
  startExercise,
  pauseExercise,
  resumeExercise,
  stopExercise,
  skipRest,
} = useAutoExercise()

// Rep phase emoji/label
const repPhaseEmoji = computed(() => {
  const map: Record<string, string> = { up: '⬆️', hold: '✊', down: '⬇️' }
  return map[currentRepPhase.value] || '🍑'
})

const repPhaseLabel = computed(() => {
  const map: Record<string, string> = { up: 'Lift Up!', hold: 'Hold It!', down: 'Lower Slowly~' }
  return map[currentRepPhase.value] || ''
})

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}`
}

function openExercisePanel(exercise: any) {
  openPanel(exercise)
}

function closeExercisePanel() {
  stopExercise()
  closePanel()
}

function startGuidedSession() {
  console.log('[ExercisePanel] startGuidedSession called')
  isGuidedSession.value = true
  
  const exerciseName = selectedExercise.value?.name || 'Exercise'
  
  // Create config in the format useAutoExercise expects
  if (exerciseName.includes('Sit') || exerciseName.includes('Plank') || exerciseName.includes('Hold')) {
    // Timed exercise
    startExercise({
      mode: 'timed',
      holdDuration: 45,
      restDuration: 30,
      countdownSeconds: 3,
      setCount: 3,
    } as any)
  } else {
    // Rep-based exercise
    startExercise({
      mode: 'reps',
      repCount: 12,
      setCount: 3,
      phaseDurationSeconds: 4,
      restSeconds: 60,
      countdownSeconds: 3,
    } as any)
  }
}

function resetAndClose() {
  isGuidedSession.value = false
  selectedExercise.value = null
}

// Expose to parent
defineExpose({ openExercisePanel, closeExercisePanel })
</script>

<style scoped>
.panel-enter-active, .panel-leave-active { transition: all 0.3s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from > div, .panel-leave-to > div { transform: translateX(100%); }
</style>
