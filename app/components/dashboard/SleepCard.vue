<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden transition-all duration-300 magical-glow-hover">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="text-2xl">🌙</span>
          Sleep Tracker
        </h3>
        <p class="text-on-surface-variant text-sm">Rest is when the magic happens!</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl animate-spin mb-3 text-primary-fixed">progress_activity</span>
      <p class="text-sm">Dreaming up your stats...</p>
    </div>

    <!-- Always show mock data for "Cutesy Princess" visualization until API is ready -->
      <!-- Main Sleep Display -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
          <span class="text-3xl">🛏️</span>
        </div>
        <div>
          <p class="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Last Night</p>
          <div class="flex items-baseline gap-2">
            <span class="font-headline text-3xl font-black text-primary">{{ sleep.duration }}</span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex items-center gap-1 bg-secondary-container/50 px-2 py-0.5 rounded-full">
              <span class="material-symbols-outlined text-xs text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">favorite</span>
              <span class="text-xs font-bold text-on-secondary-container">{{ sleep.quality }}% quality</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sleep Quality</span>
          <span class="text-xs font-bold text-primary">{{ sleep.quality }}%</span>
        </div>
        <div class="h-3 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out ribbon-gradient relative"
            :style="{ width: sleep.quality + '%' }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      <!-- Comparison -->
      <div class="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-on-surface-variant font-medium">Previous night</p>
            <p class="font-headline text-lg font-bold text-on-surface-variant">{{ sleep.previousDuration }}</p>
          </div>
          <div class="flex items-center gap-1.5 bg-primary-container/30 px-3 py-1.5 rounded-full">
            <span class="text-sm">✨</span>
            <span class="font-headline text-sm font-bold text-primary">+{{ sleep.difference }} from yesterday!</span>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
// Mock Data for "Cutesy Princess" Visualization
const mockSleep = {
  duration: '7h 30m',
  quality: 85,
  previousDuration: '6h 45m',
  difference: '45m',
}

const { data, pending } = useFetch('/api/sleep')

const sleep = computed(() => {
  // Force mock data for "Cutesy Princess" visualization until we connect the real API
  return mockSleep
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
