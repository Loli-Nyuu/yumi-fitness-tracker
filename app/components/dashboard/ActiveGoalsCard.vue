<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden transition-all duration-300 magical-glow-hover">
    <!-- Quest Log Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="text-2xl">📜</span>
          Quest Log
        </h3>
        <p class="text-on-surface-variant text-sm">Active missions — complete them all!</p>
      </div>
      <div class="flex items-center gap-1 bg-secondary-container/60 px-3 py-1.5 rounded-full">
        <span class="material-symbols-outlined text-sm text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">flag</span>
        <span class="font-headline font-bold text-sm text-on-secondary-container">{{ completedGoals }}/{{ goals.length }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl animate-spin mb-3 text-primary-fixed">progress_activity</span>
      <p class="text-sm">Unrolling the scroll...</p>
    </div>

    <!-- Quest List -->
    <div v-else class="space-y-4">
      <div
        v-for="goal in goals"
        :key="goal.label"
        class="group bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 hover:border-primary-fixed/30 transition-all duration-300 relative"
      >
        <!-- Completed Badge -->
        <div
          v-if="goal.completed"
          class="absolute -top-2 -right-2 bg-primary-fixed text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm"
        >
          <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">check</span>
          DONE!
        </div>

        <!-- Quest Title -->
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="goal.completed ? 'bg-primary-container/50' : 'bg-tertiary-container/40'"
          >
            <span class="text-lg">{{ goal.icon }}</span>
          </div>
          <div>
            <p class="font-headline font-bold text-on-surface">{{ goal.label }}</p>
            <p class="text-xs text-on-surface-variant">{{ goal.description }}</p>
          </div>
        </div>

        <!-- Progress Bar Goal -->
        <div v-if="goal.type === 'progress'">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-on-surface-variant">{{ goal.current }} / {{ goal.target }} {{ goal.unit }}</span>
            <span class="text-xs font-bold text-primary">{{ Math.round((goal.current / goal.target) * 100) }}%</span>
          </div>
          <div class="h-3 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10">
            <div
              class="h-full rounded-full transition-all duration-1000 ease-out ribbon-gradient relative"
              :style="{ width: Math.min(100, (goal.current / goal.target) * 100) + '%' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <!-- Stars / Checkmarks Goal -->
        <div v-else-if="goal.type === 'stars'" class="flex items-center gap-1">
          <div
            v-for="i in goal.target"
            :key="i"
            class="transition-all duration-500"
            :class="i <= goal.current ? 'scale-110' : 'scale-100 opacity-30'"
          >
            <span
              class="material-symbols-outlined text-2xl"
              :class="i <= goal.current ? 'text-primary-fixed' : 'text-outline-variant/40'"
              :style="i <= goal.current ? 'font-variation-settings: ' + String.fromCharCode(34) + 'FILL' + String.fromCharCode(34) + ' 1;' : ''"
            >
              star
            </span>
          </div>
          <span class="ml-2 text-xs font-bold text-on-surface-variant">{{ goal.current }}/{{ goal.target }}</span>
        </div>
      </div>
    </div>

    <!-- Motivational Footer -->
    <div class="mt-6 text-center">
      <p class="text-sm text-on-surface-variant">
        <span v-if="completedGoals === goals.length" class="text-primary font-bold">✨ All quests complete! Level up! ✨</span>
        <span v-else class="text-secondary font-bold">Keep pushing — the loot awaits! 🎯</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending } = useFetch('/api/goals')

// Mock fallback
const goals = computed(() => {
  const raw = data.value
  if (raw && Array.isArray(raw) && raw.length > 0) return raw

  return [
    {
      label: '60-sec Wall Sit',
      description: 'Hold strong like a magical barrier! 🧱',
      icon: '🏋️',
      type: 'progress',
      current: 45,
      target: 60,
      unit: 'seconds',
      completed: false,
    },
    {
      label: '3x Weekly Training',
      description: 'Complete 3 training sessions this week ✨',
      icon: '⚔️',
      type: 'stars',
      current: 2,
      target: 3,
      completed: false,
    },
  ]
})

const completedGoals = computed(() => {
  return goals.value.filter((g: any) => g.completed || (g.type === 'progress' && g.current >= g.target) || (g.type === 'stars' && g.current >= g.target)).length
})
</script>

<style scoped>
.magical-glow-hover:hover {
  filter: drop-shadow(0 0 12px rgba(255, 188, 217, 0.5));
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
