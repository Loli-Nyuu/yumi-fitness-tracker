import { ref, computed, onUnmounted } from 'vue'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Exercise execution mode */
export type ExerciseMode = 'reps' | 'timed'

/** Phase in the exercise lifecycle */
export type ExercisePhase = 'idle' | 'countdown' | 'active' | 'rest' | 'complete'

/** Sub-phases for reps mode (up → hold → down per rep) */
export type RepPhase = 'up' | 'hold' | 'down'

/** Event types emitted by the engine */
export type ExerciseEventType =
  | 'phaseChange'
  | 'repComplete'
  | 'setComplete'
  | 'sessionComplete'
  | 'repPhaseChange'
  | 'cue'

/** Callback signature for event listeners */
export type ExerciseEventCallback = (data: ExerciseEventData) => void

/** Payload for exercise events */
export interface ExerciseEventData {
  type: ExerciseEventType
  phase?: ExercisePhase
  repPhase?: RepPhase
  currentRep?: number
  currentSet?: number
  cue?: string
  progress?: number
  timeRemaining?: number
}

/** Configuration for reps mode */
export interface RepsConfig {
  mode: 'reps'
  /** Number of reps per set */
  repCount: number
  /** Number of sets */
  setCount: number
  /** Duration of each rep sub-phase in seconds */
  phaseDurationSeconds: number
  /** Rest between sets in seconds */
  restSeconds: number
  /** Countdown before starting in seconds */
  countdownSeconds: number
}

/** Configuration for timed mode */
export interface TimedConfig {
  mode: 'timed'
  /** Total hold duration in seconds */
  holdDurationSeconds: number
  /** Number of sets */
  setCount: number
  /** Rest between sets in seconds */
  restSeconds: number
  /** Countdown before starting in seconds */
  countdownSeconds: number
  /** Interval in seconds for periodic cue messages during hold */
  cueIntervalSeconds: number
}

/** Union config type */
export type ExerciseConfig = RepsConfig | TimedConfig

/** Cue message map for reps mode rep-phases */
const REP_CUES: Record<RepPhase, string> = {
  up: 'Lift up! Squeeze! 🍑',
  hold: 'Hold it tight! 💪',
  down: 'Lower slowly~ 💛',
}

/** Rep-phase order */
const REP_PHASE_ORDER: RepPhase[] = ['up', 'hold', 'down']

/** Encouragement cues during timed hold */
const TIMED_HOLD_CUES = [
  'Keep holding! 💪',
  'You got this! 🍑',
  'Squeeze tighter! 🔥',
  'Almost there! ⭐',
  'Feel the burn! 💛',
]

// ─── Composable ──────────────────────────────────────────────────────────────

export function useAutoExercise() {
  // ── Reactive State ──────────────────────────────────────────────────────

  /** Current lifecycle phase */
  const phase = ref<ExercisePhase>('idle')

  /** Current rep (1-indexed) */
  const currentRep = ref(0)

  /** Current set (1-indexed) */
  const currentSet = ref(0)

  /** Current sub-phase within a rep (reps mode only) */
  const currentRepPhase = ref<RepPhase>('up')

  /** Seconds remaining in the current tick/phase */
  const timeRemaining = ref(0)

  /** Current cue message to display */
  const currentCue = ref('')

  /** Progress percentage (0-100) for the overall session */
  const progress = ref(0)

  /** Whether the exercise is paused */
  const isPaused = ref(false)

  /** Stored config (set on start) */
  const config = ref<ExerciseConfig | null>(null)

  // ── Internal ────────────────────────────────────────────────────────────

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null
  const listeners = new Map<ExerciseEventType, Set<ExerciseEventCallback>>()

  /** Saved state for resume after pause */
  let pausedRemaining = 0

  // ── Event System ────────────────────────────────────────────────────────

  function on(event: ExerciseEventType, cb: ExerciseEventCallback) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(cb)
    return () => off(event, cb)
  }

  function off(event: ExerciseEventType, cb: ExerciseEventCallback) {
    listeners.get(event)?.delete(cb)
  }

  function emit(event: ExerciseEventType, extra: Partial<ExerciseEventData> = {}) {
    const data: ExerciseEventData = {
      type: event,
      phase: phase.value,
      repPhase: currentRepPhase.value,
      currentRep: currentRep.value,
      currentSet: currentSet.value,
      cue: currentCue.value,
      progress: progress.value,
      timeRemaining: timeRemaining.value,
      ...extra,
    }
    listeners.get(event)?.forEach(cb => cb(data))
  }

  // ── Timer Helpers ───────────────────────────────────────────────────────

  /** Clear all running intervals */
  function clearAllTimers() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null }
    // Don't clear sessionTimer - it should run for the whole session
    if (progressRaf) { cancelAnimationFrame(progressRaf); progressRaf = null }
  }

  /** Run a countdown with smooth rAF progress bar */
  function runTimer(durationSeconds: number, tickFn: (remaining: number) => void, onComplete: () => void) {
    const durationMs = durationSeconds * 1000
    phaseDurationMs = durationMs
    phaseStartTime = performance.now()
    timeRemaining.value = durationSeconds
    countdownValue.value = durationSeconds
    phaseProgressMs.value = 100
    tickFn(timeRemaining.value)

    // Cancel any existing rAF
    if (progressRaf) cancelAnimationFrame(progressRaf)
    
    // Start rAF loop for smooth progress
    const updateProgress = (now: number) => {
      const elapsed = now - phaseStartTime
      const remaining = Math.max(0, durationMs - elapsed)
      const remainingSecs = Math.ceil(remaining / 1000)
      
      // Update progress percentage
      phaseProgressMs.value = (remaining / durationMs) * 100
      
      // Update second-precise values for display
      if (remainingSecs !== timeRemaining.value) {
        timeRemaining.value = remainingSecs
        countdownValue.value = remainingSecs
        tickFn(remainingSecs)
      }
      
      if (remaining <= 0) {
        clearAllTimers()
        if (progressRaf) cancelAnimationFrame(progressRaf)
        progressRaf = null
        onComplete()
      } else {
        progressRaf = requestAnimationFrame(updateProgress)
      }
    }
    
    progressRaf = requestAnimationFrame(updateProgress)
  }

  // ── Progress Calculation ────────────────────────────────────────────────

  /** Calculate total seconds for the entire session */
  function totalSessionSeconds(): number {
    if (!config.value) return 1
    const cfg = config.value

    if (cfg.mode === 'reps') {
      const repTime = cfg.phaseDurationSeconds * REP_PHASE_ORDER.length
      const setWork = repTime * cfg.repCount
      const setRest = cfg.restSeconds * (cfg.setCount - 1)
      return cfg.countdownSeconds + (setWork * cfg.setCount) + setRest
    } else {
      const setWork = cfg.holdDurationSeconds
      const setRest = cfg.restSeconds * (cfg.setCount - 1)
      return cfg.countdownSeconds + (setWork * cfg.setCount) + setRest
    }
  }

  /** Recalculate progress based on sets/rep work done so far */
  function recalcProgress() {
    const total = totalSessionSeconds()
    if (total <= 0) { progress.value = 0; return }
    const cfg = config.value!
    let elapsed = 0

    // Add countdown done (already past it if we're here)
    if (phase.value !== 'countdown') {
      elapsed += cfg.countdownSeconds
    } else {
      elapsed += cfg.countdownSeconds - timeRemaining.value
      progress.value = Math.round((elapsed / total) * 100)
      return
    }

    // Add completed sets
    if (cfg.mode === 'reps') {
      const repTime = cfg.phaseDurationSeconds * REP_PHASE_ORDER.length
      const completedSets = currentSet.value - 1
      elapsed += completedSets * (repTime * cfg.repCount + cfg.restSeconds)

      // Current set reps done
      if (phase.value === 'active') {
        const doneRepPhases = REP_PHASE_ORDER.indexOf(currentRepPhase.value)
        elapsed += (currentRep.value - 1) * repTime + doneRepPhases * cfg.phaseDurationSeconds
      } else if (phase.value === 'rest') {
        elapsed += repTime * cfg.repCount + (cfg.restSeconds - timeRemaining.value)
      } else if (phase.value === 'complete') {
        elapsed = total
      }
    } else {
      // timed
      const completedSets = currentSet.value - 1
      elapsed += completedSets * (cfg.holdDurationSeconds + cfg.restSeconds)

      if (phase.value === 'active') {
        elapsed += cfg.holdDurationSeconds - timeRemaining.value
      } else if (phase.value === 'rest') {
        elapsed += cfg.holdDurationSeconds + (cfg.restSeconds - timeRemaining.value)
      } else if (phase.value === 'complete') {
        elapsed = total
      }
    }

    progress.value = Math.min(100, Math.round((elapsed / total) * 100))
  }

  // ── Phase Transitions ──────────────────────────────────────────────────

  /** Transition to a new phase */
  function setPhase(newPhase: ExercisePhase, cue?: string) {
    phase.value = newPhase
    if (cue) currentCue.value = cue
    emit('phaseChange', { phase: newPhase, cue: currentCue.value })
  }

  // ── Reps Mode ──────────────────────────────────────────────────────────

  /** Advance through rep sub-phases (up → hold → down) */
  function advanceRepPhase() {
    if (!config.value || config.value.mode !== 'reps') return
    const cfg = config.value
    const idx = REP_PHASE_ORDER.indexOf(currentRepPhase.value)

    if (idx < REP_PHASE_ORDER.length - 1) {
      // Move to next sub-phase
      currentRepPhase.value = REP_PHASE_ORDER[idx + 1]
      currentCue.value = REP_CUES[currentRepPhase.value]
      emit('repPhaseChange', { repPhase: currentRepPhase.value, cue: currentCue.value })

      runTimer(cfg.phaseDurationSeconds, (rem) => {
        recalcProgress()
      }, advanceRepPhase)
    } else {
      // Rep complete!
      emit('repComplete', { currentRep: currentRep.value })
      currentRep.value++

      if (currentRep.value > cfg.repCount) {
        // Set complete
        emit('setComplete', { currentSet: currentSet.value })

        if (currentSet.value >= cfg.setCount) {
          // Session complete
          finishSession()
          return
        }
        // Rest between sets
        startRest()
      } else {
        // Next rep — reset sub-phase
        currentRepPhase.value = 'up'
        currentCue.value = `Rep ${currentRep.value}! ${REP_CUES.up}`
        emit('repPhaseChange', { repPhase: 'up', cue: currentCue.value })

        runTimer(cfg.phaseDurationSeconds, () => recalcProgress(), advanceRepPhase)
      }
    }
  }

  /** Start reps mode: begin countdown then first rep */
  function startReps(cfg: RepsConfig) {
    setPhase('countdown', 'Get ready... 3, 2, 1!')

    runTimer(cfg.countdownSeconds, (remaining) => {
      if (remaining <= 3 && remaining > 0) {
        currentCue.value = `${remaining}...`
        emit('cue', { cue: currentCue.value })
      }
      recalcProgress()
    }, () => {
      // Countdown done — start session timer and first set
      sessionElapsed.value = 0
      if (sessionTimer) clearInterval(sessionTimer)
      sessionTimer = setInterval(() => {
        sessionElapsed.value++
      }, 1000)
      
      currentSet.value = 1
      currentRep.value = 1
      currentRepPhase.value = 'up'
      currentCue.value = `Go! ${REP_CUES.up}`
      setPhase('active', currentCue.value)

      runTimer(cfg.phaseDurationSeconds, () => recalcProgress(), advanceRepPhase)
    })
  }

  // ── Timed Mode ─────────────────────────────────────────────────────────

  /** Run a timed hold with periodic cues */
  function startTimedHold(cfg: TimedConfig) {
    setPhase('active', 'Hold it! 🔥')
    let cueIdx = 0

    runTimer(cfg.holdDurationSeconds, (remaining) => {
      // Periodic encouragement cues
      const elapsed = cfg.holdDurationSeconds - remaining
      if (elapsed > 0 && elapsed % cfg.cueIntervalSeconds === 0) {
        cueIdx = (cueIdx + 1) % TIMED_HOLD_CUES.length
        currentCue.value = TIMED_HOLD_CUES[cueIdx]
        emit('cue', { cue: currentCue.value })
      }
      recalcProgress()
    }, () => {
      emit('setComplete', { currentSet: currentSet.value })

      if (currentSet.value >= cfg.setCount) {
        finishSession()
      } else {
        startRest()
      }
    })
  }

  /** Start timed mode: countdown then first hold */
  function startTimed(cfg: TimedConfig) {
    setPhase('countdown', 'Get ready... 3, 2, 1!')

    runTimer(cfg.countdownSeconds, (remaining) => {
      if (remaining <= 3 && remaining > 0) {
        currentCue.value = `${remaining}...`
        emit('cue', { cue: currentCue.value })
      }
      recalcProgress()
    }, () => {
      // Countdown done — start session timer
      sessionElapsed.value = 0
      if (sessionTimer) clearInterval(sessionTimer)
      sessionTimer = setInterval(() => {
        sessionElapsed.value++
      }, 1000)
      
      currentSet.value = 1
      currentCue.value = 'Go! Hold it! 🔥'
      startTimedHold(cfg)
    })
  }

  // ── Rest ────────────────────────────────────────────────────────────────

  /** Start rest period between sets */
  function startRest() {
    const cfg = config.value!
    const restDur = cfg.restSeconds
    setPhase('rest', `Rest up! 😮‍💨 Next set in ${restDur}s`)

    runTimer(restDur, (remaining) => {
      currentCue.value = `Rest... ${remaining}s 💤`
      recalcProgress()
    }, () => {
      // Rest done — next set
      currentSet.value++
      currentRep.value = 1
      currentRepPhase.value = 'up'

      if (cfg.mode === 'reps') {
        currentCue.value = `Set ${currentSet.value}! Let's go! ${REP_CUES.up}`
        setPhase('active', currentCue.value)
        runTimer(cfg.phaseDurationSeconds, () => recalcProgress(), advanceRepPhase)
      } else {
        currentCue.value = `Set ${currentSet.value}! Hold it! 🔥`
        startTimedHold(cfg)
      }
    })
  }

  // ── Session Finish ─────────────────────────────────────────────────────

  function finishSession() {
    clearAllTimers()
    progress.value = 100
    setPhase('complete', 'Amazing work! Session complete! 🎉🍑')
    emit('sessionComplete', {
      currentSet: currentSet.value,
      currentRep: currentRep.value,
      progress: 100,
    })
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /** Start a new exercise session */
  function startExercise(exerciseConfig: ExerciseConfig) {
    // Reset state
    clearAllTimers()
    phase.value = 'idle'
    currentRep.value = 0
    currentSet.value = 0
    currentRepPhase.value = 'up'
    timeRemaining.value = 0
    currentCue.value = ''
    progress.value = 0
    isPaused.value = false
    sessionElapsed.value = 0
    config.value = exerciseConfig

    if (exerciseConfig.mode === 'reps') {
      startReps(exerciseConfig)
    } else {
      startTimed(exerciseConfig)
    }
  }

  /** Pause the current exercise, preserving state for resume */
  function pauseExercise() {
    if (phase.value === 'idle' || phase.value === 'complete' || isPaused.value) return
    clearAllTimers()
    pausedRemaining = timeRemaining.value
    isPaused.value = true
    currentCue.value = 'Paused ⏸️'
  }

  /** Resume from paused state */
  function resumeExercise() {
    if (!isPaused.value || phase.value === 'complete') return
    isPaused.value = false
    const cfg = config.value!

    // Resume the countdown from where we paused
    if (phase.value === 'countdown') {
      runTimer(pausedRemaining, (remaining) => {
        if (remaining <= 3 && remaining > 0) {
          currentCue.value = `${remaining}...`
        }
        recalcProgress()
      }, () => {
        currentSet.value = 1
        currentRep.value = 1
        if (cfg.mode === 'reps') {
          currentRepPhase.value = 'up'
          currentCue.value = REP_CUES.up
          setPhase('active', currentCue.value)
          runTimer(cfg.phaseDurationSeconds, () => recalcProgress(), advanceRepPhase)
        } else {
          startTimedHold(cfg as TimedConfig)
        }
      })
      return
    }

    if (phase.value === 'active') {
      if (cfg.mode === 'reps') {
        currentCue.value = REP_CUES[currentRepPhase.value]
        setPhase('active', currentCue.value)
        runTimer(pausedRemaining, () => recalcProgress(), advanceRepPhase)
      } else {
        currentCue.value = 'Keep holding! 💪'
        setPhase('active', currentCue.value)
        let cueIdx = 0
        runTimer(pausedRemaining, (remaining) => {
          const elapsed = (cfg as TimedConfig).holdDurationSeconds - remaining
          if (elapsed > 0 && elapsed % (cfg as TimedConfig).cueIntervalSeconds === 0) {
            cueIdx = (cueIdx + 1) % TIMED_HOLD_CUES.length
            currentCue.value = TIMED_HOLD_CUES[cueIdx]
            emit('cue', { cue: currentCue.value })
          }
          recalcProgress()
        }, () => {
          emit('setComplete', { currentSet: currentSet.value })
          if (currentSet.value >= cfg.setCount) {
            finishSession()
          } else {
            startRest()
          }
        })
      }
      return
    }

    if (phase.value === 'rest') {
      currentCue.value = `Rest... ${pausedRemaining}s 💤`
      setPhase('rest', currentCue.value)
      runTimer(pausedRemaining, (remaining) => {
        currentCue.value = `Rest... ${remaining}s 💤`
        recalcProgress()
      }, () => {
        currentSet.value++
        currentRep.value = 1
        currentRepPhase.value = 'up'
        if (cfg.mode === 'reps') {
          currentCue.value = `Set ${currentSet.value}! ${REP_CUES.up}`
          setPhase('active', currentCue.value)
          runTimer(cfg.phaseDurationSeconds, () => recalcProgress(), advanceRepPhase)
        } else {
          currentCue.value = `Set ${currentSet.value}! Hold it! 🔥`
          startTimedHold(cfg as TimedConfig)
        }
      })
    }
  }

  /** Stop the exercise entirely — resets to idle */
  function stopExercise() {
    clearAllTimers()
    // Clear session timer on stop
    if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null }
    isPaused.value = false
    setPhase('idle', '')
    progress.value = 0
    currentRep.value = 0
    currentSet.value = 0
    currentRepPhase.value = 'up'
    timeRemaining.value = 0
  }

  // ── Cleanup ────────────────────────────────────────────────────────────

  onUnmounted(() => {
    clearAllTimers()
    listeners.clear()
  })

  // ── Return ─────────────────────────────────────────────────────────────

  const countdownValue = ref(3)
  const sessionElapsed = ref(0)
  let sessionTimer: ReturnType<typeof setInterval> | null = null
  
  // Millisecond-precise phase progress (0-100)
  const phaseProgressMs = ref(100)
  let phaseStartTime = 0
  let phaseDurationMs = 0
  let progressRaf: number | null = null

  function startCountdown() {
    phase.value = 'countdown'
    countdownValue.value = 3
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
      countdownValue.value--
      if (countdownValue.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval)
        countdownInterval = null
        beginActivePhase()
      }
    }, 1000)
  }

  function beginActivePhase() {
    // Start session timer
    sessionElapsed.value = 0
    if (sessionTimer) clearInterval(sessionTimer)
    sessionTimer = setInterval(() => {
      sessionElapsed.value++
    }, 1000)
    
    if (config.value!.mode === 'reps') {
      startReps(config.value as any)
    } else {
      startTimed(config.value as any)
    }
  }

  function skipRest() {
    if (restTimer) clearInterval(restTimer)
    restTimer = null
    timeRemaining.value = 0
    handleRestComplete()
  }

  return {
    // State
    phase,
    currentRep,
    currentSet,
    currentRepPhase,
    timeRemaining,
    currentCue,
    progress,
    isPaused,
    countdownValue,
    sessionElapsed,
    phaseProgressMs,
    config: config,

    // Actions
    startExercise,
    pauseExercise,
    resumeExercise,
    stopExercise,
    skipRest,

    // Events
    on,
    off,
  }
}
