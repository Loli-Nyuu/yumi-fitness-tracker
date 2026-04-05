<template>
  <Transition name="panel">
    <div v-if="showExercisePanel" class="fixed inset-0 z-50 flex justify-end" @click.self="closeExercisePanel">
      <div class="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col" style="background: var(--surface); border-left: 1px solid var(--border)">
        <!-- Close button -->
        <div class="flex justify-end mb-4">
          <button @click="closeExercisePanel" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style="background: var(--surface-light); color: var(--text-muted)">
            <Icon name="material-symbols:close-rounded" />
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

          <!-- Form Cues -->
          <div v-if="selectedExercise?.formCuesJson" class="mb-4">
            <h3 class="text-sm font-semibold mb-2" style="color: var(--text-muted)">Yumi's Form Tips</h3>
            <ul class="space-y-2">
              <li v-for="(cue, idx) in JSON.parse(selectedExercise.formCuesJson)" :key="idx" class="text-sm flex items-start gap-2">
                <span style="color: var(--primary)">✓</span>
                <span style="color: var(--text)">{{ cue.text }}</span>
              </li>
            </ul>
          </div>

          <!-- Pattern Badge -->
          <div class="flex justify-center mb-6">
            <span v-if="selectedExercise?.pattern === 'timed'" class="px-3 py-1 text-xs rounded-full font-medium" style="background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent)">⏱️ Timed Hold</span>
            <span v-else class="px-3 py-1 text-xs rounded-full font-medium" style="background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary)">🔄 Rep-based</span>
          </div>

          <button @click="startGuidedSession"
            class="mt-auto w-full py-3 rounded-xl font-semibold transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon name="material-symbols:play-circle-outline-rounded" /> Start Guided Session
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
          <!-- Session timer at top -->
          <div class="absolute top-6 right-6 px-3 py-1 rounded-lg text-sm font-mono" style="background: var(--surface-light); color: var(--text-muted)">
            {{ formatSessionTime(sessionElapsed) }}
          </div>
          
          <h3 class="text-xl font-bold mb-2" style="color: var(--primary)">{{ selectedExercise?.name }}</h3>
          
          <!-- Rep phase indicator (Only for Reps mode) -->
          <div v-if="currentRepPhase && phase === 'active' && config?.mode === 'reps'" class="mb-4">
            <div class="text-5xl mb-2 animate-bounce">{{ repPhaseEmoji }}</div>
            <p class="text-xl font-semibold" style="color: var(--primary)">{{ repPhaseLabel }}</p>
          </div>

          <!-- Timer / Rep counter -->
          <div class="mb-4">
            <!-- Show Rep Counter only for Reps mode -->
            <p v-if="phase === 'active' && config?.mode === 'reps'" class="text-2xl mb-2" style="color: var(--text-muted)">
              Rep {{ currentRep }} / {{ config?.repCount || 12 }}
            </p>
            
            <!-- Show Main Timer/Cue -->
            <p class="text-6xl font-mono font-bold" style="color: var(--primary)">
              {{ phase === 'countdown' ? countdownValue : (currentCue || formatTime(timeRemaining)) }}
            </p>
          </div>

          <!-- Progress bar for current phase (smooth rAF animation) -->
          <div v-if="phase === 'active'" class="w-full max-w-xs mb-4">
            <div class="h-2 rounded-full overflow-hidden" style="background: var(--surface-light)">
              <div class="h-full rounded-full" 
                :style="{ width: phaseProgressMs + '%', background: 'var(--primary)' }"></div>
            </div>
            <p class="text-xs mt-1" style="color: var(--text-muted)">{{ timeRemaining }}s remaining</p>
          </div>

          <!-- Set indicator -->
          <p class="text-sm mb-4" style="color: var(--text-muted)">Set {{ currentSet }}</p>

          <!-- Current cue message -->
          <div v-if="currentCue" class="mb-6 p-4 rounded-xl animate-pulse" style="background: color-mix(in srgb, var(--primary) 15%, transparent)">
            <p class="text-sm font-medium" style="color: var(--primary)">{{ currentCue }}</p>
          </div>

          <!-- Pause/Resume & Stop buttons -->
          <div class="flex gap-3">
            <button 
              @click="isPaused ? resumeExercise() : pauseExercise()" 
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :style="{ background: isPaused ? 'var(--success)' : 'var(--surface-light)', color: isPaused ? 'var(--background)' : 'var(--text)' }">
              {{ isPaused ? 'Resume' : 'Pause' }}
            </button>
            <button @click="stopExercise" class="px-4 py-2 rounded-xl text-sm font-medium" :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
              Stop
            </button>
          </div>
        </div>

        <!-- REST VIEW -->
        <div v-else-if="phase === 'rest'" class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Session timer at top -->
          <div class="absolute top-6 right-6 px-3 py-1 rounded-lg text-sm font-mono" style="background: var(--surface-light); color: var(--text-muted)">
            {{ formatSessionTime(sessionElapsed) }}
          </div>
          
          <div class="text-6xl mb-4 animate-pulse">💤</div>
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Rest Time!</h3>
          <p class="text-6xl font-mono font-bold my-4" style="color: var(--primary)">{{ formatTime(timeRemaining) }}</p>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Next set coming up...</p>
          <button @click="skipRest" class="px-6 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style="z-index: 10; background: var(--surface-light); color: var(--text)">
            Skip Rest
          </button>
        </div>

        <!-- PAUSED OVERLAY (Optional: if you want a full screen pause, otherwise the button toggle is enough) -->
        <!-- We are removing the separate paused view to keep it simple and use the toggle button instead. -->

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
              <Icon name="material-symbols:play-circle-outline-rounded" /> New Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useExercisePanel } from '~/composables/useExercisePanel'
import { useAutoExercise } from '~/composables/useAutoExercise'
import type { ExerciseConfig, RepsModeConfig, TimedModeConfig } from '~/types/exercise-config'

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
  sessionElapsed,
  phaseProgressMs,
  sessionComplete,
  config,
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

function formatSessionTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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
  
  const ex = selectedExercise.value
  if (!ex) return

  console.log('[ExercisePanel] Exercise pattern:', ex.pattern)
  console.log('[ExercisePanel] Exercise defaults:', ex.defaultsJson)

  // Parse defaults from the exercise data
  let defaults = {}
  try {
    defaults = JSON.parse(ex.defaultsJson || '{}')
  } catch {}

  // Base config
  const baseConfig = {
    setCount: defaults.setCount || 3,
    restSeconds: defaults.restBetweenSets || 60,
    countdownSeconds: defaults.countdownSeconds || 5,
  }

  // Pattern-specific config
  if (ex.pattern === 'timed') {
    console.log('[ExercisePanel] Starting TIMED session')
    startExercise({
      mode: 'timed',
      holdDurationSeconds: defaults.holdDurationSeconds || 45,
      cueIntervalSeconds: 10,
      ...baseConfig,
    } as any)
  } else {
    console.log('[ExercisePanel] Starting REPS session')
    // Default to reps
    const phases = defaults.phaseDurations || { concentric: 2, isometric: 2, eccentric: 2 }
    startExercise({
      mode: 'reps',
      repCount: defaults.repCount || 12,
      phaseDurationSeconds: phases.concentric + phases.isometric + phases.eccentric,
      ...baseConfig,
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
