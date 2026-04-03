import { ref, computed } from 'vue'
import { useWebSocket } from '@vueuse/core'

// Exercise panel state
const showExercisePanel = ref(false)
const selectedExercise = ref<any>(null)
const isGuidedSession = ref(false)

// Guided session state
const currentSet = ref(1)
const totalSets = ref(3)
const currentRep = ref(0)
const targetReps = ref(12)
const isResting = ref(false)
const restSeconds = ref(60)
const restCountdown = ref(0)
const sessionMessages = ref<string[]>([])
const sessionComplete = ref(false)
let restInterval: ReturnType<typeof setInterval> | null = null

// WS connection for real-time trainer messages
let wsSend: ReturnType<typeof useWebSocket>['send'] | null = null

export function useExercisePanel() {
  // Connect WebSocket for real-time messages
  if (import.meta.client) {
    onMounted(() => {
      const { send } = useWebSocket('/_ws', {
        autoReconnect: { retries: 3, delay: 3000 },
      })
      wsSend = send
    })
  }

  function openExercisePanel(exercise: any) {
    selectedExercise.value = exercise
    isGuidedSession.value = false
    showExercisePanel.value = true
    sessionMessages.value = []
  }

  function closeExercisePanel() {
    showExercisePanel.value = false
    selectedExercise.value = null
    isGuidedSession.value = false
    resetGuidedSession()
  }

  function startGuidedSession() {
    isGuidedSession.value = true
    currentSet.value = 1
    currentRep.value = 0
    restSeconds.value = 60
    restCountdown.value = 0
    isResting.value = false
    sessionMessages.value = []
    
    // Send session start event via WS
    if (wsSend && selectedExercise.value) {
      wsSend(JSON.stringify({
        event: 'exercise:sessionStarted',
        data: {
          exerciseId: selectedExercise.value.id,
          exerciseName: selectedExercise.value.name,
          totalSets: totalSets.value,
          targetReps: targetReps.value,
        },
      }))
    }
  }

  function resetGuidedSession() {
    currentSet.value = 1
    currentRep.value = 0
    isResting.value = false
    restCountdown.value = 0
  }

  function completeRep() {
    currentRep.value++
    if (currentRep.value >= targetReps.value) {
      // Set complete, start rest
      startRest()
    }
  }

  function startRest() {
    isResting.value = true
    restCountdown.value = restSeconds.value
    
    if (restInterval) clearInterval(restInterval)
    restInterval = setInterval(() => {
      restCountdown.value--
      if (restCountdown.value <= 0) {
        if (restInterval) clearInterval(restInterval)
        restInterval = null
        endRest()
      }
    }, 1000)
  }

  function endRest() {
    isResting.value = false
    if (currentSet.value < totalSets.value) {
      currentSet.value++
      currentRep.value = 0
    } else {
      // Session complete
      sessionComplete.value = true
      completeSession()
    }
  }

  function completeSession() {
    isGuidedSession.value = false
    
    // Send completion event
    if (wsSend && selectedExercise.value) {
      wsSend(JSON.stringify({
        event: 'exercise:sessionCompleted',
        data: {
          exerciseId: selectedExercise.value.id,
          exerciseName: selectedExercise.value.name,
          setsCompleted: totalSets.value,
          repsPerSet: targetReps.value,
        },
      }))
    }
  }

  function skipRest() {
    if (restInterval) clearInterval(restInterval)
    restInterval = null
    endRest()
  }

  function resetAfterComplete() {
    sessionComplete.value = false
    resetGuidedSession()
    isGuidedSession.value = false
  }

  function addSessionMessage(msg: string) {
    sessionMessages.value.push(msg)
    if (sessionMessages.value.length > 4) {
      sessionMessages.value.shift()
    }
  }

  return {
    showExercisePanel,
    selectedExercise,
    isGuidedSession,
    currentSet,
    totalSets,
    currentRep,
    targetReps,
    isResting,
    restSeconds,
    restCountdown,
    sessionMessages,
    sessionComplete,
    openExercisePanel,
    closeExercisePanel,
    startGuidedSession,
    completeRep,
    startRest,
    endRest,
    completeSession,
    addSessionMessage,
    skipRest,
    resetAfterComplete,
  }
}
