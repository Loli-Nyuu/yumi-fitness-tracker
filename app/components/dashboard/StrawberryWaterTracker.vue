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
    <div class="flex flex-wrap gap-6 justify-center py-10 bg-surface-container-low rounded-[2rem] border border-dashed border-tertiary-container/40 min-h-[200px]">
      <div v-if="todaysDrinks.length === 0" class="flex items-center justify-center w-full text-on-surface-variant opacity-50">
        <p>No magic potions yet today! ✨</p>
      </div>
      
      <div v-for="(drink, index) in todaysDrinks" :key="index" 
        class="flex flex-col items-center gap-2 animate-bounce"
        :style="{ animationDelay: `${index * 0.1}s` }">
        <img :src="getDrinkImage(drink.type)" :alt="drink.type" class="w-16 h-16 object-contain" />
        <span class="text-[10px] font-bold text-on-surface-variant uppercase">{{ drink.type }}</span>
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

interface DrinkLog {
  type: string;
  amountMl: number;
}

const isModalOpen = ref(false)
const { data: fluidData, refresh: refreshFluids } = useFetch('/api/fluids')

const summary = computed(() => fluidData.value?.summary || { effectiveMl: 0, targetMl: 2500 })
const entries = computed(() => fluidData.value?.entries || [])
const effectiveMl = computed(() => summary.value.effectiveMl)
const targetMl = computed(() => summary.value.targetMl)
const currentCups = computed(() => Math.floor(effectiveMl.value / 250))
const totalCups = computed(() => Math.max(8, Math.ceil(targetMl.value / 250)))

const todaysDrinks = computed(() => {
  return entries.value.map((e: any) => ({
    type: e.type,
    amountMl: e.amountMl
  }))
})

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

async function handleAddDrink(drink: { type: string, amountMl: number }) {
  await $fetch('/api/fluids', {
    method: 'POST',
    body: drink
  })
  refreshFluids()
}
</script>
