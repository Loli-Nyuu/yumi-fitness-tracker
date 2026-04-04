<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined">water_drop</span>
          Strawberry Water Tracker
        </h3>
        <p class="text-on-surface-variant">Stay hydrated to keep your magic flowing!</p>
      </div>
      <div class="text-right">
        <span class="text-3xl font-headline font-black text-primary">{{ currentCups }} / {{ totalCups }}</span>
        <p class="text-xs font-bold text-on-surface-variant uppercase">Cups</p>
      </div>
    </div>

    <!-- Strawberry Icons -->
    <div class="flex flex-wrap gap-6 justify-center py-10 bg-surface-container-low rounded-[2rem] border border-dashed border-tertiary-container/40">
      <div v-for="i in totalCups" :key="i" 
        class="flex flex-col items-center gap-2"
        :class="{ 'animate-bounce': i <= currentCups }"
        :style="{ animationDelay: `${i * 0.1}s` }">
        <span class="material-symbols-outlined text-5xl" 
          :style="{ 'font-variation-settings': i <= currentCups ? '\'FILL\' 1' : '\'FILL\' 0', 'color': i <= currentCups ? '#f74b6d' : '#ffb6c1' }">
          nutrition
        </span>
      </div>
    </div>

    <div class="mt-8 flex justify-center">
      <button @click="addWater" class="bg-tertiary-container text-on-tertiary-container px-12 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
        <span class="material-symbols-outlined">add</span>
        Drink 1 Cup
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: fluidData, refresh: refreshFluids } = useFetch('/api/fluids')

const summary = computed(() => fluidData.value?.summary || { effectiveMl: 0, targetMl: 2500 })
const effectiveMl = computed(() => summary.value.effectiveMl)
const targetMl = computed(() => summary.value.targetMl)
const currentCups = computed(() => Math.floor(effectiveMl.value / 250))
const totalCups = computed(() => Math.max(8, Math.ceil(targetMl.value / 250)))

async function addWater() {
  await $fetch('/api/fluids', {
    method: 'POST',
    body: { type: 'water', amountMl: 250 }
  })
  refreshFluids()
}
</script>
