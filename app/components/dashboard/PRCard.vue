<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined">emoji_events</span>
          Personal Records
        </h3>
        <p class="text-on-surface-variant text-sm">Your strongest moments, all in one place!</p>
      </div>
      <div class="flex items-center gap-1 bg-secondary-container/60 px-3 py-1.5 rounded-full">
        <span class="material-symbols-outlined text-sm text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="font-headline font-bold text-sm text-on-secondary-container">{{ prs.length }} PRs</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl animate-spin mb-3 text-primary-fixed">progress_activity</span>
      <p class="text-sm">Summoning your records...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="prs.length === 0" class="flex flex-col items-center justify-center py-16 text-on-surface-variant/60">
      <span class="material-symbols-outlined text-5xl mb-3">military_tech</span>
      <p class="text-sm font-medium">No PRs yet — go make some history!</p>
    </div>

    <!-- Bento Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="pr in prs"
        :key="pr.id"
        class="group relative bg-surface-container-low rounded-[1.25rem] p-4 border border-outline-variant/10 hover:border-primary-fixed/30 transition-all duration-300 hover:scale-[1.03] magical-glow cursor-default"
        :class="{ 'ring-2 ring-primary-fixed/40 bg-primary/5': isNewPR(pr) }"
      >
        <!-- New PR Badge -->
        <div
          v-if="isNewPR(pr)"
          class="absolute -top-2 -right-2 bg-primary-fixed text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full pr-badge flex items-center gap-0.5 shadow-sm"
        >
          <span class="material-symbols-outlined text-[12px]">auto_awesome</span>
          NEW!
        </div>

        <!-- Exercise Icon -->
        <div class="w-9 h-9 rounded-full bg-tertiary-container/40 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-lg text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">
            {{ getExerciseIcon(pr.exerciseSlug) }}
          </span>
        </div>

        <!-- Exercise Name -->
        <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider truncate mb-1">
          {{ pr.exerciseName || pr.exerciseSlug }}
        </p>

        <!-- Record Value -->
        <div class="flex items-baseline gap-1">
          <span class="font-headline text-2xl font-black text-primary">{{ pr.value }}</span>
          <span class="text-xs text-on-surface-variant font-medium">{{ pr.unit }}</span>
        </div>

        <!-- Improvement vs Previous -->
        <div v-if="pr.previousRecord" class="mt-2 flex items-center gap-1">
          <span class="material-symbols-outlined text-xs text-success">trending_up</span>
          <span class="text-[11px] text-success font-bold">
            +{{ (pr.value - pr.previousRecord).toFixed(1) }} {{ pr.unit }}
          </span>
        </div>

        <!-- Date -->
        <p class="text-[10px] text-on-surface-variant/50 mt-2">{{ formatDate(pr.date) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mock Data for "Cutesy Princess" Visualization
const mockPRs = [
  { id: 1, exerciseSlug: 'wall-sit', exerciseName: 'Wall Sit', value: 60, unit: 'sec', previousRecord: 50, date: '2026-04-02' },
  { id: 2, exerciseSlug: 'glute-bridge', exerciseName: 'Glute Bridge', value: 85, unit: 'reps', previousRecord: 70, date: '2026-04-03' },
  { id: 3, exerciseSlug: 'plank', exerciseName: 'Plank', value: 90, unit: 'sec', previousRecord: 80, date: '2026-04-01' }
]

const { data, pending } = useFetch('/api/pr')

const prs = computed(() => {
  const raw = data.value
  // Use mock data if API returns nothing (for visualization)
  if ((!raw || !Array.isArray(raw) || raw.length === 0) && mockPRs.length > 0) return mockPRs
  return raw || []
})

function isNewPR(pr: any): boolean {
  if (!pr.date) return false
  const prDate = new Date(pr.date)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  return prDate >= threeDaysAgo
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getExerciseIcon(slug: string): string {
  if (!slug) return 'fitness_center'
  const iconMap: Record<string, string> = {
    'glute-bridge': 'fitness_center',
    'glute-bridges': 'fitness_center',
    'single-leg-glute-bridge': 'fitness_center',
    'squat': 'sports_gymnastics',
    'sumo-squat': 'sports_gymnastics',
    'wall-sit': 'timer',
    'plank': 'self_improvement',
    'donkey-kick': 'directions_run',
    'clam-shell': 'accessibility_new',
    'fire-hydrant': 'local_fire_department',
  }
  return iconMap[slug] || 'fitness_center'
}
</script>

<style scoped>
@keyframes pr-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 110, 169, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(255, 110, 169, 0); }
}

.ring-2 {
  animation: pr-pulse 2s ease-in-out infinite;
}
</style>
