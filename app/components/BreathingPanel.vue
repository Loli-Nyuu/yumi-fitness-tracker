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

        <!-- NOT STARTED: Pattern detail -->
        <div v-if="!activeBreathing" class="flex-1 flex flex-col items-center justify-center text-center">
          <Icon :name="icons.breathing" class="text-5xl mb-4" style="color: var(--primary)" />
          <h3 class="text-xl font-bold mb-1" style="color: var(--primary)">{{ selectedPattern?.name }}</h3>
          <p class="text-sm mb-6" style="color: var(--text-muted)">{{ selectedPattern?.helps }}</p>
          <div class="w-full p-4 rounded-xl mb-6" style="background: var(--surface-light)">
            <p class="text-sm" style="color: var(--text)">{{ selectedPattern?.instructions }}</p>
          </div>

          <!-- Round presets -->
          <p class="text-xs mb-2" style="color: var(--text-muted)">Repeat for</p>
          <div class="flex flex-wrap gap-2 mb-6 justify-center">
            <button v-for="opt in roundOptions" :key="opt.value" @click="selectedRounds = opt.value"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              :style="selectedRounds === opt.value
                ? { background: 'var(--primary)', color: 'var(--background)' }
                : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              {{ opt.label }}
            </button>
          </div>

          <button @click="startBreathingSession"
            class="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            :style="{ background: 'var(--primary)', color: 'var(--background)' }">
            <Icon :name="icons.start" /> Start
          </button>
        </div>

        <!-- STARTED: Visual guide -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center">
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

          <!-- Stop button -->
          <button @click="stopBreathing"
            class="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
            :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }">
            <Icon :name="icons.stop" /> Stop
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
  activeBreathing,
  breathPhase,
  breathTimer,
  breathRounds,
  breathElapsed,
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
} = useBreathingPanel()
</script>

<style scoped>
.panel-enter-active, .panel-leave-active { transition: all 0.3s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from > div, .panel-leave-to > div { transform: translateX(100%); }
</style>
