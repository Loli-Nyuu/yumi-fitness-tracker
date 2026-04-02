import { ref, computed } from 'vue'

const breathingPatterns = [
  {
    id: 'box', name: 'Box Breathing',
    helps: 'Reduces stress and anxiety. Great before meetings or after heated moments.',
    instructions: 'Breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4. Keep a steady rhythm like tracing a square.',
    inhale: 4, hold1: 4, exhale: 4, hold2: 4,
    inhaleRoute: 'nose', exhaleRoute: 'nose',
  },
  {
    id: '478', name: '4-7-8 Breathing',
    helps: 'Natural sleep aid. Use before bed or when you can\'t fall asleep.',
    instructions: 'Breathe in through your nose for 4 seconds, hold for 7, then slowly exhale through your mouth for 8. The long exhale is key.',
    inhale: 4, hold1: 7, exhale: 8, hold2: 0,
    inhaleRoute: 'nose', exhaleRoute: 'mouth',
  },
  {
    id: 'diaphragmatic', name: 'Deep Belly Breathing',
    helps: 'Activates the parasympathetic system. Good for focus and recovery.',
    instructions: 'Place a hand on your belly. Breathe deep so your belly rises (not your chest). Inhale 5 seconds, brief hold, exhale 5 seconds.',
    inhale: 5, hold1: 2, exhale: 5, hold2: 0,
    inhaleRoute: 'nose', exhaleRoute: 'nose',
  },
  {
    id: 'energizing', name: 'Energizing Breath',
    helps: 'Quick energy boost. Use in the afternoon slump instead of coffee.',
    instructions: 'Fast inhale through nose (2 sec), sharp exhale through mouth (1 sec). Short, rhythmic. Like a gentle bellows.',
    inhale: 2, hold1: 0, exhale: 1, hold2: 0,
    inhaleRoute: 'nose', exhaleRoute: 'mouth',
  },
]

const roundOptions = [
  { label: '3 rounds', value: 3 },
  { label: '5 rounds', value: 5 },
  { label: '10 rounds', value: 10 },
  { label: '∞ Free', value: 0 },
]

const showBreathingPanel = ref(false)
const selectedPattern = ref<any>(null)
const selectedRounds = ref(5)
const activeBreathing = ref<any>(null)
const breathPhase = ref('inhale')
const breathTimer = ref(0)
const breathRounds = ref(1)
const breathElapsed = ref(0)

let breathInterval: ReturnType<typeof setInterval> | null = null
let breathElapsedInterval: ReturnType<typeof setInterval> | null = null

// Visual circle state
const breathCircleSize = ref(25)
const breathCircleTransition = ref('all 0.3s ease')
const breathCircleBg = ref('color-mix(in srgb, var(--primary) 30%, transparent)')
const breathCircleOpacity = ref(0.5)

let eventSource: EventSource | null = null

function updateBreathCircle(phase: string, durationSec: number) {
  const dur = durationSec > 0 ? durationSec : 1
  const transition = `width ${dur}s ease-in-out, height ${dur}s ease-in-out, opacity ${dur}s ease-in-out`
  if (phase === 'inhale') {
    breathCircleTransition.value = transition
    breathCircleSize.value = 85
    breathCircleBg.value = 'var(--primary)'
    breathCircleOpacity.value = 1
  } else if (phase === 'hold1' || phase === 'hold2') {
    breathCircleTransition.value = 'background 0.3s ease'
    breathCircleBg.value = 'var(--accent)'
  } else if (phase === 'exhale') {
    breathCircleTransition.value = transition
    breathCircleSize.value = 25
    breathCircleBg.value = 'color-mix(in srgb, var(--primary) 30%, transparent)'
    breathCircleOpacity.value = 0.5
  }
}

const breathPhaseLabel = computed(() => {
  if (breathPhase.value === 'hold1') return 'inhale hold'
  if (breathPhase.value === 'hold2') return 'exhale hold'
  return breathPhase.value
})

const breathRouteIndicator = computed(() => {
  const p = activeBreathing.value
  if (!p) return null
  if (breathPhase.value === 'inhale') return p.inhaleRoute || null
  if (breathPhase.value === 'exhale') return p.exhaleRoute || null
  return null
})

function openBreathingPanel(pattern?: any) {
  if (pattern) {
    selectedPattern.value = pattern
    activeBreathing.value = null
  }
  showBreathingPanel.value = true
}

function closeBreathingPanel() {
  if (activeBreathing.value) stopBreathing()
  showBreathingPanel.value = false
  selectedPattern.value = null
}

function startBreathingSession() {
  const pattern = selectedPattern.value
  if (!pattern) return
  activeBreathing.value = pattern
  breathRounds.value = 1
  breathElapsed.value = 0

  if (breathInterval) clearInterval(breathInterval)
  if (breathElapsedInterval) clearInterval(breathElapsedInterval)
  breathElapsedInterval = setInterval(() => { breathElapsed.value++ }, 1000)

  const rawPhases = ['inhale', 'hold1', 'exhale', 'hold2']
  const rawDurations = [pattern.inhale, pattern.hold1, pattern.exhale, pattern.hold2]
  const phases: string[] = []
  const durations: number[] = []
  for (let i = 0; i < 4; i++) {
    if (rawDurations[i] > 0) {
      phases.push(rawPhases[i])
      durations.push(rawDurations[i])
    }
  }
  if (phases.length === 0) return

  let phaseIndex = 0

  breathCircleSize.value = 25
  breathCircleTransition.value = 'none'
  breathPhase.value = phases[0]
  breathTimer.value = durations[0]

  requestAnimationFrame(() => {
    updateBreathCircle(phases[0], durations[0])
  })

  breathInterval = setInterval(() => {
    breathTimer.value--
    if (breathTimer.value <= 0) {
      phaseIndex = (phaseIndex + 1) % phases.length
      if (phaseIndex === 0) {
        breathRounds.value++
        if (selectedRounds.value > 0 && breathRounds.value > selectedRounds.value) {
          stopBreathing()
          return
        }
      }
      breathPhase.value = phases[phaseIndex]
      breathTimer.value = durations[phaseIndex]
      updateBreathCircle(phases[phaseIndex], durations[phaseIndex])
    }
  }, 1000)
}

async function stopBreathing() {
  if (breathInterval) clearInterval(breathInterval)
  if (breathElapsedInterval) clearInterval(breathElapsedInterval)
  const pattern = activeBreathing.value
  if (pattern && breathElapsed.value > 0) {
    await $fetch('/api/breathing', { method: 'POST', body: { pattern: pattern.name, duration: breathElapsed.value, rounds: breathRounds.value } })
  }
  activeBreathing.value = null
}

function startSSE() {
  if (typeof window === 'undefined') return
  if (eventSource && eventSource.readyState === EventSource.OPEN) return
  
  eventSource = new EventSource('/api/stream')
  
  eventSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.event === 'breathing:open' && msg.data?.pattern) {
        const pattern = breathingPatterns.find(p => p.id === msg.data.pattern)
        if (pattern) {
          openBreathingPanel(pattern)
        }
      }
    } catch {}
  }
  
  eventSource.onerror = () => {
    // SSE will auto-reconnect, but clean up broken connection
    eventSource?.close()
    eventSource = null
    setTimeout(() => startSSE(), 3000)
  }
}

export function useBreathingPanel() {
  if (import.meta.client && !eventSource) {
    onMounted(() => { startSSE() })
  }

  return {
    breathingPatterns,
    roundOptions,
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
    openBreathingPanel,
    closeBreathingPanel,
    startBreathingSession,
    stopBreathing,
  }
}
