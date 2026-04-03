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

          <!-- Title & category -->
          <h2 class="text-2xl font-bold mb-1" style="color: var(--primary)">{{ selectedExercise?.name }}</h2>
          <p class="text-sm mb-4" style="color: var(--text-muted)">
            {{ selectedExercise?.category }} · {{ selectedExercise?.musclePrimary }}
          </p>

          <!-- Description -->
          <div class="mb-4 p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text)">{{ selectedExercise?.description }}</p>
          </div>

          <!-- Kid-friendly tip -->
          <div v-if="selectedExercise?.kidFriendlyTip" class="mb-4 p-3 rounded-xl" style="background: color-mix(in srgb, var(--primary) 10%, transparent)">
            <p class="text-sm italic" style="color: var(--primary)">{{ selectedExercise.kidFriendlyTip }}</p>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-if="selectedExercise?.isAnkleSafe" class="px-2 py-1 text-xs rounded-full" style="background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success)">🦶 Ankle Safe</span>
            <span class="px-2 py-1 text-xs rounded-full" style="background: var(--surface-light); color: var(--text-muted)">{{ selectedExercise?.equipment }}</span>
            <span class="px-2 py-1 text-xs rounded-full" style="background: var(--surface-light); color: var(--text-muted)">{{ selectedExercise?.preference }}</span>
          </div>

          <!-- Form cues -->
          <div v-if="selectedExercise?.formCues?.length" class="mb-6">
            <h3 class="text-sm font-semibold mb-2" style="color: var(--text-muted)">Form Cues</h3>
            <ul class="space-y-1">
              <li v-for="(cue, idx) in selectedExercise.formCues" :key="idx" class="text-sm flex items-start gap-2">
                <span style="color: var(--primary)">✓</span>
                <span style="color: var(--text)">{{ cue }}</span>
              </li>
            </ul>
          </div>

          <!-- Start button -->
          <button @click="startGuidedSession"
            class="mt-auto w-full py-3 rounded-xl font-semibold transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon :name="icons.start" /> Start Guided Session
          </button>
        </div>

        <!-- GUIDED SESSION VIEW -->
        <div v-else-if="!sessionComplete" class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Exercise name -->
          <h3 class="text-xl font-bold mb-6" style="color: var(--primary)">{{ selectedExercise?.name }}</h3>

          <!-- Rest timer overlay -->
          <div v-if="isResting" class="absolute inset-0 flex items-center justify-center" style="background: color-mix(in srgb, var(--surface) 95%, transparent)">
            <div class="text-center">
              <p class="text-sm mb-2" style="color: var(--text-muted)">Rest between sets</p>
              <p class="text-6xl font-mono font-bold mb-4" style="color: var(--primary)">{{ restCountdown }}</p>
              <button @click="skipRest" class="px-6 py-2 rounded-xl text-sm font-medium"
                :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
                Skip Rest
              </button>
            </div>
          </div>

          <!-- Set/Rep display -->
          <div class="mb-6">
            <p class="text-sm mb-1" style="color: var(--text-muted)">Set {{ currentSet }} of {{ totalSets }}</p>
            <p class="text-5xl font-mono font-bold" style="color: var(--primary)">{{ currentRep }} / {{ targetReps }}</p>
            <p class="text-sm mt-1" style="color: var(--text-muted)">reps</p>
          </div>

          <!-- Trainer messages -->
          <div v-if="sessionMessages.length > 0" class="mb-6 w-full max-w-xs">
            <div v-for="(msg, idx) in sessionMessages" :key="idx"
              class="text-xs p-2 rounded mb-1"
              :style="{
                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                color: 'var(--text-muted)',
                opacity: 0.5 + (idx / Math.max(1, sessionMessages.length - 1)) * 0.5,
              }">
              {{ msg }}
            </div>
          </div>

          <!-- Rep button -->
          <button @click="completeRep"
            class="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 mb-4"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            ✓ Complete Rep
          </button>

          <!-- Cancel -->
          <button @click="closeExercisePanel" class="text-sm" style="color: var(--text-muted)">
            End Session
          </button>
        </div>

        <!-- SESSION COMPLETE VIEW -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center">
          <!-- Celebration -->
          <div class="mb-6">
            <div class="text-6xl animate-bounce">💪</div>
            <div class="text-4xl mt-2 animate-pulse">✨ 🍑 ✨</div>
          </div>
          
          <h3 class="text-2xl font-bold mb-2" style="color: var(--primary)">Exercise Complete!</h3>
          <p class="text-lg mb-4" style="color: var(--text)">Amazing work, Yuyu!</p>
          
          <!-- Stats -->
          <div class="mb-6 p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text-muted)">You completed</p>
            <p class="text-3xl font-bold" style="color: var(--primary)">{{ totalSets }} sets × {{ targetReps }} reps</p>
            <p class="text-sm mt-1" style="color: var(--text-muted)">of {{ selectedExercise?.name }}</p>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-col gap-3 w-full max-w-xs">
            <button @click="closeExercisePanel"
              class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              :style="{ background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              Close
            </button>
            <button @click="resetAfterComplete"
              class="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              :style="{ background: 'var(--primary)', color: 'var(--background)' }">
              <Icon :name="icons.start" /> Do Another Exercise
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

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
  window.addEventListener('theme-change', ((e: CustomEvent) => { currentTheme.value = e.detail.theme }) as EventListener)
})

const {
  showExercisePanel,
  selectedExercise,
  isGuidedSession,
  sessionComplete,
  currentSet,
  totalSets,
  currentRep,
  targetReps,
  isResting,
  restCountdown,
  sessionMessages,
  closeExercisePanel,
  startGuidedSession,
  completeRep,
  skipRest,
  resetAfterComplete,
} = useExercisePanel()
</script>

<style scoped>
.panel-enter-active, .panel-leave-active { transition: all 0.3s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from > div, .panel-leave-to > div { transform: translateX(100%); }
</style>
