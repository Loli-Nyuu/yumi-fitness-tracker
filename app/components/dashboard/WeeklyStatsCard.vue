<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined">calendar_month</span>
          This Week's Quest
        </h3>
        <p class="text-on-surface-variant text-sm">Keep the streak alive, princess!</p>
      </div>
      <div class="flex items-center gap-1 bg-secondary-container/60 px-3 py-1.5 rounded-full">
        <span class="material-symbols-outlined text-sm text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
        <span class="font-headline font-bold text-sm text-on-secondary-container">{{ completedSessions }}/{{ plannedSessions }}</span>
      </div>
    </div>

    <!-- Star Progress -->
    <div class="flex justify-center gap-3 mb-6">
      <div
        v-for="i in plannedSessions"
        :key="i"
        class="relative transition-all duration-500"
        :class="i <= completedSessions ? 'scale-110' : 'scale-100 opacity-30'"
      >
        <span
          class="material-symbols-outlined text-3xl transition-colors duration-300"
          :class="i <= completedSessions ? 'text-primary-fixed' : 'text-outline-variant/40'"
          :style="i <= completedSessions ? 'font-variation-settings: ' + String.fromCharCode(34) + 'FILL' + String.fromCharCode(34) + ' 1' : ''"
        >
          {{ i <= completedSessions ? 'star' : 'star' }}
        </span>
        <!-- Sparkle effect on completed stars -->
        <div
          v-if="i <= completedSessions"
          class="absolute -top-1 -right-1 w-2 h-2 bg-primary-fixed rounded-full animate-ping opacity-60"
        />
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Weekly Progress</span>
        <span class="text-xs font-bold text-primary">{{ progressPercent }}%</span>
      </div>
      <div class="h-3 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10">
        <div
          class="h-full rounded-full transition-all duration-1000 ease-out ribbon-gradient relative"
          :style="{ width: progressPercent + '%' }"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-8 text-on-surface-variant">
      <span class="material-symbols-outlined text-3xl animate-spin mb-2 text-primary-fixed">progress_activity</span>
      <p class="text-xs">Counting your victories...</p>
    </div>

    <!-- Weekly Breakdown -->
    <div v-else class="space-y-3">
      <div
        v-for="day in weekDays"
        :key="day.label"
        class="flex items-center justify-between py-2 px-3 rounded-xl transition-colors"
        :class="day.hasSession ? 'bg-surface-container-low' : 'bg-transparent'"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            :class="day.hasSession
              ? 'bg-primary-container text-on-primary-container'
              : day.isToday
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface-variant'"
          >
            {{ day.shortLabel }}
          </div>
          <div>
            <p class="text-sm font-medium text-on-surface">{{ day.label }}</p>
            <p v-if="day.sessionInfo" class="text-[10px] text-on-surface-variant">{{ day.sessionInfo }}</p>
            <p v-else-if="day.isToday" class="text-[10px] text-secondary font-bold">Today</p>
          </div>
        </div>
        <div v-if="day.hasSession">
          <span class="material-symbols-outlined text-success" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
        <div v-else-if="day.isFuture" class="text-on-surface-variant/30">
          <span class="material-symbols-outlined">radio_button_unchecked</span>
        </div>
      </div>
    </div>

    <!-- Motivational Footer -->
    <div class="mt-6 text-center">
      <p class="text-sm text-on-surface-variant">
        <span v-if="progressPercent >= 100" class="text-primary font-bold">✨ Perfect week! You're unstoppable! ✨</span>
        <span v-else-if="completedSessions === 0" class="text-secondary font-bold">Your week starts now — let's go! 🔥</span>
        <span v-else>{{ remainingSessions }} more {{ remainingSessions === 1 ? 'session' : 'sessions' }} to crush! 💪</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending } = useFetch('/api/sessions')

const plannedSessions = ref(5) // Default weekly target

const weekDays = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)) // Get Monday

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const fullLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const sessions = data.value || []

  return labels.map((label, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const daySession = sessions.find((s: any) => s.date === dateStr)
    const isToday = dateStr === today.toISOString().split('T')[0]
    const isFuture = date > today

    return {
      label: fullLabels[i],
      shortLabel: label,
      hasSession: !!daySession,
      isToday,
      isFuture,
      sessionInfo: daySession ? (daySession.status === 'completed' ? 'Completed ✓' : daySession.status) : null,
    }
  })
})

const completedSessions = computed(() => {
  return weekDays.value.filter(d => d.hasSession).length
})

const progressPercent = computed(() => {
  if (plannedSessions.value === 0) return 0
  return Math.min(100, Math.round((completedSessions.value / plannedSessions.value) * 100))
})

const remainingSessions = computed(() => {
  return Math.max(0, plannedSessions.value - completedSessions.value)
})
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
