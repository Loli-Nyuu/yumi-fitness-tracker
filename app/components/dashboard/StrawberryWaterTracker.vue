<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] relative overflow-hidden">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h3 class="font-headline text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined">water_drop</span>
          Magical Hydration Station
        </h3>
        <p class="text-on-surface-variant">Stay hydrated to keep your magic flowing!</p>
      </div>
      <div class="text-right">
        <span class="text-3xl font-headline font-black text-primary">{{ currentCups }} / {{ totalCups }}</span>
        <p class="text-xs font-bold text-on-surface-variant uppercase">Cups</p>
      </div>
    </div>

    <!-- Drink Images Grid -->
    <div class="flex flex-wrap gap-4 justify-center py-10 bg-surface-container-low rounded-[2rem] border border-dashed border-tertiary-container/40 min-h-[200px]">
      <div v-if="todaysDrinks.length === 0" class="flex items-center justify-center w-full text-on-surface-variant opacity-50">
        <p>No magic potions yet today! ✨</p>
      </div>
      
      <div v-for="(drink, index) in todaysDrinks" :key="index" 
        class="relative group flex flex-col items-center justify-center p-2 transition-transform hover:scale-110 cursor-help"
        :style="getSizeScale(drink.amountMl)">
        
        <!-- The Drink Image -->
        <img :src="getDrinkImage(drink.type)" :alt="drink.type" class="w-14 h-14 object-contain drop-shadow-sm" />

        <!-- Cute Tooltip -->
        <div class="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-surface-container-highest rounded-xl p-3 shadow-xl border border-outline-variant/20 z-10 text-center">
          <p class="text-xs font-bold text-primary capitalize">{{ drink.type }}</p>
          <p v-if="drink.subtype" class="text-[10px] text-on-surface-variant capitalize">{{ drink.subtype }}</p>
          <div class="mt-1 pt-1 border-t border-outline-variant/20 flex justify-between text-[10px] text-on-surface">
            <span>{{ drink.amountMl }}ml</span>
            <span class="font-bold text-tertiary-container">{{ getEffectiveMl(drink) }}ml</span>
          </div>
          <!-- Little triangle for tooltip -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface-container-highest"></div>
        </div>
      </div>
    </div>

    <!-- Add Drink Button -->
    <div class="mt-8 flex justify-center">
      <button @click="isModalOpen = true" class="bg-tertiary-container text-on-tertiary-container px-12 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
        <span class="material-symbols-outlined">add</span>
        Add Drink
      </button>
    </div>

    <!-- Add Drink Modal -->
    <AddDrinkModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @add="handleAddDrink" 
    />
  </div>
</template>

<script setup lang="ts">
import AddDrinkModal from './AddDrinkModal.vue'

const { data: fluidData, refresh: refreshFluids } = useFetch('/api/fluids')

const summary = computed(() => fluidData.value?.summary || { effectiveMl: 0, targetMl: 2500 })
const entries = computed(() => fluidData.value?.entries || [])
const effectiveMlTotal = computed(() => summary.value.effectiveMl)
const targetMl = computed(() => summary.value.targetMl)
const currentCups = computed(() => Math.floor(effectiveMlTotal.value / 250))
const totalCups = computed(() => Math.max(8, Math.ceil(targetMl.value / 250)))

const todaysDrinks = computed(() => {
  return entries.value.map((e: any) => ({
    type: e.type,
    subtype: e.subtype || null,
    amountMl: e.amountMl,
    hydrationFactor: getHydrationFactor(e.type)
  }))
})

function getHydrationFactor(type: string) {
  const factors: Record<string, number> = { water: 1.0, juice: 1.0, tea: 0.9, soda: 0.8, coffee: 0.8 }
  return factors[type] || 0.9
}

function getEffectiveMl(drink: any) {
  return Math.round(drink.amountMl * drink.hydrationFactor)
}

function getSizeScale(amountMl: number) {
  let scale = 1;
  if (amountMl <= 150) scale = 0.85; // Small
  else if (amountMl >= 350) scale = 1.15; // Large
  return { transform: `scale(${scale})` };
}

function getDrinkImage(type: string) {
  const map: Record<string, string> = {
    water: '/images/drinks/water-glass.png',
    coffee: '/images/drinks/coffee-cup.png',
    tea: '/images/drinks/tea-cup.png',
    juice: '/images/drinks/juice-glass.png',
    soda: '/images/drinks/soda-glass.png'
  }
  return map[type] || '/images/drinks/water-glass.png'
}

const isModalOpen = ref(false)

async function handleAddDrink(drink: { type: string, amountMl: number }) {
  await $fetch('/api/fluids', {
    method: 'POST',
    body: drink
  })
  refreshFluids()
}
</script>
