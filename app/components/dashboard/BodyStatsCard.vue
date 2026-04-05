<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden transition-all duration-300 magical-glow-hover">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">monitoring</span>
          Body Stats
        </h3>
        <p class="text-on-surface-variant text-sm">Your latest measurements, princess!</p>
      </div>
      <div class="flex items-center gap-1 bg-tertiary-container/40 px-3 py-1.5 rounded-full">
        <span class="material-symbols-outlined text-sm text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">scale</span>
        <span class="font-headline font-bold text-sm text-on-tertiary-container">{{ stats[0]?.date || 'Today' }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl animate-spin mb-3 text-primary-fixed">progress_activity</span>
      <p class="text-sm">Measuring your magic...</p>
    </div>

    <!-- Bento Grid -->
    <div v-else class="grid grid-cols-2 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="group relative bg-surface-container-low rounded-[1.25rem] p-5 border border-outline-variant/10 hover:border-primary-fixed/30 transition-all duration-300 hover:scale-[1.03]"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-lg text-primary" style="font-variation-settings: 'FILL' 1;">
            {{ stat.icon }}
          </span>
        </div>

        <!-- Label -->
        <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{{ stat.label }}</p>

        <!-- Value -->
        <div class="flex items-baseline gap-1">
          <span class="font-headline text-2xl font-black text-primary">{{ stat.value }}</span>
          <span class="text-xs text-on-surface-variant font-medium">{{ stat.unit }}</span>
        </div>

        <!-- Trend -->
        <div class="mt-2 flex items-center gap-1">
          <span class="material-symbols-outlined text-xs" :class="stat.trend > 0 ? 'text-secondary' : stat.trend < 0 ? 'text-success' : 'text-on-surface-variant'">
            {{ stat.trend > 0 ? 'trending_up' : stat.trend < 0 ? 'trending_down' : 'trending_flat' }}
          </span>
          <span class="text-[11px] font-bold" :class="stat.trend > 0 ? 'text-secondary' : stat.trend < 0 ? 'text-success' : 'text-on-surface-variant'">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}{{ stat.trendUnit }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mock Data for "Cutesy Princess" Visualization
const mockStats = [
  { label: 'Weight', value: '68.0', unit: 'kg', icon: 'scale', trend: -0.3, trendUnit: 'kg', date: 'Apr 4' },
  { label: 'Waist', value: '82', unit: 'cm', icon: 'straighten', trend: -1.0, trendUnit: 'cm', date: 'Apr 4' },
  { label: 'Hips', value: '98', unit: 'cm', icon: 'swap_horiz', trend: +0.5, trendUnit: 'cm', date: 'Apr 4' },
  { label: 'WHR', value: '0.84', unit: '', icon: 'data_usage', trend: -0.01, trendUnit: '', date: 'Apr 4' },
]

const { data, pending } = useFetch('/api/body')

const stats = computed(() => {
  const raw = data.value
  // Use mock if API is empty for visualization
  if ((!raw || !Array.isArray(raw) || raw.length === 0) && mockStats.length > 0) return mockStats
  return raw || []
})
</script>

<style scoped>
.magical-glow-hover:hover {
  filter: drop-shadow(0 0 12px rgba(255, 188, 217, 0.5));
}
</style>
