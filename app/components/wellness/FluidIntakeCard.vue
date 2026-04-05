<template>
  <div class="bg-surface-container-lowest p-6 md:col-span-2 relative rounded-2xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] magical-glow transition-all duration-300 hover:shadow-[0px_10px_48px_rgba(125,78,88,0.32)]">
    <div class="flex flex-wrap justify-between items-start mb-4">
      <div>
        <h2 class="flex items-center text-2xl font-headline text-primary gap-2">
          <Icon name="material-symbols:water-full-outline-rounded" class="text-3xl" style="color: #ff6ea9" />
          <!-- <span class="material-symbols-outlined" style="color: #b30065">water_drop</span> -->
          Hydration Station
        </h2>
        <p class="hidden sm:block text-on-surface-variant text-xs">Stay hydrated~!</p>
      </div>

      <div class="flex gap-2 justify-end mb-3">
        <button @click="showFluidHistory = true"
          class="rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style="background: var(--surface-light); color: var(--text-muted)" title="Fluid History">
          <Icon name="material-symbols:format-list-bulleted" class="text-lg mr-2" />
          History
        </button>
      </div>
    </div>

    <!-- Drink Images Grid (Grouped) -->
    <div class="relative flex flex-wrap gap-3 justify-center py-4 bg-surface-container-low rounded-[1rem] border border-dashed border-tertiary-container/40 min-h-[120px]">
      <div v-if="uniqueDrinks.length === 0" class="flex items-center justify-center w-full text-on-surface-variant opacity-50">
        <p>No magic potions yet today! 💧</p>
      </div>

      <div class="absolute top-0 right-2 text-right flex justify-end items-baseline gap-2">
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-headline font-black text-primary">T. {{ summary.effectiveMl }}ml</span>
        </div>
        <p class="text-xs text-on-surface-variant font-thin" title="effective">{{ summary.targetMl }} ml</p>
      </div>

      <div v-for="drink in uniqueDrinks" :key="drink.key"
        class="relative group flex flex-col items-center justify-center p-1 transition-transform group cursor-help"
        :style="{ transform: `scale(${getSizeScale(drink.ml)})` }">

        <!-- The Drink Image -->
        <img :src="getDrinkImage(drink.type)" :alt="drink.type" class="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-125 transition-transform" />

        <!-- Quantity Label -->
        <div v-if="drink.count > 1" class="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-thin px-1.5 py-0.5 rounded-full border-2 border-surface-container-low">
          x{{ drink.count }}
        </div>

        <!-- Cute Dark Tooltip -->
        <div class="absolute bottom-full mb-2 hidden group-hover:block w-36 bg-[#1f1c1d]/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/10 z-10 text-center">
          <p class="text-xs font-bold text-primary-fixed capitalize">
            {{ drink.type }}
            <span v-if="drink.subtype" class="text-white/80 font-normal">({{ drink.subtype }})</span>
          </p>
          <div class="mt-1 pt-1 border-t border-white/10 text-sm text-white">
            {{ drink.ml }}ml
            <span class="font-bold text-tertiary-fixed">({{ Math.round(drink.ml * hydrationFactor(drink.type)) }}ml)</span>
          </div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1f1c1d]/90"></div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="mt-6 space-y-4">
      <!-- Compact Type Selection with Images -->
      <div class="flex flex-wrap justify-center gap-2">
        <div v-for="type in fluidTypes" :key="type.id" class="relative">
          <button
            @click="selectedFluid = type.id"
            class="flex aspect-square rounded-xl transition-all duration-300 border-2 p-1"
            :class="selectedFluid === type.id ? 'bg-tertiary-container shadow-[0_0_10px_rgba(255,182,193,0.4)] border-primary' : 'bg-surface-container-low hover:bg-surface-container border-transparent'">
            <img :src="type.icon" class="w-15 h-15 object-contain mb-1" />
            <!-- <span class="text-[8px] font-bold text-on-surface-variant">{{ type.short || type.label }}</span> -->
          </button>
        </div>
      </div>

      <!-- Subtype Selection -->
      <Transition name="slide-down">
        <div v-if="currentSubtypes.length > 0" class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
          <div class="relative">
            <select v-model="selectedSubtype" class="w-full bg-surface p-2 rounded-lg text-sm text-on-surface border border-outline-variant focus:border-primary focus:ring-0 outline-none appearance-none cursor-pointer">
              <option v-for="sub in currentSubtypes" :key="sub" :value="sub">{{ sub }}</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm pointer-events-none">expand_more</span>
          </div>
        </div>
      </Transition>

      <!-- Compact Size Selection -->
      <div class="flex flex-wrap gap-2 justify-center">
        <button v-for="size in currentSizes" :key="size.ml" @click="addFluid(size.ml)"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md bg-surface-container-low border border-outline-variant/50 hover:border-primary/50 hover:scale-105">
          <img :src="getDrinkImage(selectedFluid)" class="w-4 h-4 object-contain" />
          <span>{{ size.shortLabel || size.label }}</span>
        </button>
      </div>

      <div class="flex gap-2 justify-center">
        <input v-model.number="customAmount" type="number" placeholder="ml"
          class="w-20 px-2 py-2 rounded-full text-center text-sm font-bold" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        <button @click="addFluid(customAmount)" class="px-5 py-2 rounded-full font-black transition-transform hover:scale-105 active:scale-95 flex items-center gap-1 text-sm"
          style="background: linear-gradient(135deg, #ff6ea9 0%, #b30065 100%); color: white; border-radius: 9999px; box-shadow: 0 4px 12px rgba(179, 0, 101, 0.3);">
          <span class="material-symbols-outlined text-xs">add</span>
          Add
        </button>
      </div>
    </div>

  </div>

  <!-- Fluid History Modal -->
  <MagicalModal v-model="showFluidHistory" title="Potion Journal" icon="water_drop">
    <div v-if="fluidHistoryGrouped.length" class="space-y-3">
      <div v-for="day in fluidHistoryGrouped" :key="day.dateStr" class="rounded-2xl bg-surface border border-outline-variant/20 overflow-hidden">
        <!-- Day Header (Accordion) -->
        <button @click="toggleDay(day.dateStr)" class="w-full p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
          <div class="flex flex-col items-start">
            <span class="text-sm font-bold text-primary">{{ formatDate(day.dateStr) }}</span>
            <span class="text-[10px] text-on-surface-variant/70">{{ day.count }} drinks · {{ Math.round(day.effectiveMl / 2500 * 100) }}% of target</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-sm font-black" style="color: var(--primary)">{{ day.effectiveMl }}ml</span>
              <span class="text-[10px] ml-1 text-on-surface-variant/70">effective</span>
            </div>
            <span class="material-symbols-outlined transition-transform" :class="expandedDays[day.dateStr] ? 'rotate-180' : ''">expand_more</span>
          </div>
        </button>

        <!-- Expanded List -->
        <div v-if="expandedDays[day.dateStr]" class="bg-surface-container-lowest p-2 space-y-2">
          <div v-for="drink in day.drinks" :key="drink.id" class="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/10 hover:scale-[1.01] transition-transform">
            <div class="flex items-center gap-3">
              <img :src="getDrinkImage(drink.type)" class="w-8 h-8 object-contain" />
              <div>
                <span class="text-sm font-bold capitalize text-on-surface">{{ drink.type }}</span>
                <span v-if="drink.subtype" class="text-[10px] text-on-surface-variant/70 block">({{ drink.subtype }})</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-medium text-on-surface-variant/70">{{ drink.amountMl }}ml</span>
              <button @click="confirmDelete(drink)" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-600/10 text-on-surface-variant/50 hover:text-danger">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-center py-6 text-on-surface-variant/70">No potion history yet! 🧪</p>
  </MagicalModal>

  <!-- Delete Confirmation Modal -->
  <MagicalModal v-model="showDeleteConfirm" title="Delete drink?" icon="warning" close-icon="close">
    <div class="text-center space-y-4">
      <p class="text-on-surface-variant">Are you sure you want to delete this <span class="font-bold text-primary capitalize">{{ deleteTarget?.type }}</span> ({{ deleteTarget?.amountMl }}ml)?</p>
      <div class="flex gap-3 justify-center mt-6">
        <button @click="showDeleteConfirm = false" class="px-4 py-2 rounded-full font-bold bg-surface text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
        <button @click="executeDelete" class="px-4 py-2 rounded-full font-bold bg-red-600 text-white shadow-lg shadow-red-600/20 hover:scale-105 transition-transform">Delete</button>
      </div>
    </div>
  </MagicalModal>
</template>

<script setup lang="ts">
const { data: fluidData, refresh: refreshFluids } = useFetch<any>('/api/fluids')
const summary = computed(() => fluidData.value?.summary || { byType: {}, totalMl: 0, effectiveMl: 0, targetMl: 2500, percentComplete: 0 })
const entries = computed(() => fluidData.value?.entries || [])
const showFluidHistory = ref(false)

// Fetch ALL raw entries for the journal using the fixed ?date=all endpoint
const { data: allFluidsData, refresh: refreshAllFluids } = useFetch<any[]>('/api/fluids?date=all')

// Group fluids by date and sort descending (most recent first)
const fluidHistoryGrouped = computed(() => {
  // The API now returns an array of days with 'drinks' arrays inside
  return (allFluidsData.value || []).map(day => ({
    dateStr: day.date,
    drinks: day.drinks || [],
    effectiveMl: day.effectiveMl,
    count: day.count
  }))
})

// Track which days are expanded
const expandedDays = ref<Record<string, boolean>>({})

// Delete confirmation state
const showDeleteConfirm = ref(false)
const deleteTarget = ref<any>(null)

function toggleDay(dateStr: string) {
  // Close all other days first for an accordion effect
  // Object.keys(expandedDays.value).forEach(d => expandedDays.value[d] = false)
  expandedDays.value[dateStr] = !expandedDays.value[dateStr]
}

function confirmDelete(drink: any) {
  deleteTarget.value = drink
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (deleteTarget.value) {
    await $fetch(`/api/fluids?id=${deleteTarget.value.id}`, { method: 'DELETE' })
    await refreshFluids()
    await refreshAllFluids()
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

interface DrinkGroup { key: string; type: string; subtype?: string | null; ml: number; count: number; ids: number[] }

// Group by Type + Subtype + Amount
const uniqueDrinks = computed<DrinkGroup[]>(() => {
  const map = new Map<string, DrinkGroup>()
  for (const entry of entries.value) {
    const subtype = entry.subtype || null
    const key = `${entry.type}-${subtype || 'none'}-${entry.amountMl}`
    if (!map.has(key)) map.set(key, { key, type: entry.type, subtype, ml: entry.amountMl, count: 0, ids: [] })
    const g = map.get(key)!; g.count++; g.ids.push(entry.id)
  }
  return Array.from(map.values())
})

const selectedFluid = ref('water')
const selectedSubtype = ref('')
const customAmount = ref(250)

const fluidTypes = [
  { id: 'water', label: 'Water', short: 'H2O', icon: '/images/drinks/water-glass.png' },
  { id: 'coffee', label: 'Coffee', short: 'Coffee', icon: '/images/drinks/coffee-cup.png' },
  { id: 'tea', label: 'Tea', short: 'Tea', icon: '/images/drinks/tea-cup.png' },
  { id: 'juice', label: 'Juice', short: 'Juice', icon: '/images/drinks/juice-glass.png' },
  { id: 'soda', label: 'Soda', short: 'Soda', icon: '/images/drinks/soda-glass.png' },
]

const subtypes: Record<string, string[]> = {
  water: [],
  coffee: ['Black Coffee', 'Espresso', 'Cappuccino', 'Latte'],
  tea: ['Spearmint', 'Green Tea', 'Black Tea', 'Chamomile', 'Earl Grey'],
  juice: ['Green Juice', 'Orange', 'Apple', 'Pineapple', 'Passion Fruit'],
  soda: ['Coke Zero', 'Coke', 'Sprite', 'Fanta', 'Root Beer']
}

const currentSubtypes = computed(() => subtypes[selectedFluid.value] || [])

watch(selectedFluid, (newType) => {
  if (subtypes[newType].length > 0) {
    selectedSubtype.value = subtypes[newType][0]
  } else {
    selectedSubtype.value = ''
  }
})

const hydrationFactors: Record<string, number> = { water: 1.0, tea: 0.9, juice: 1.0, soda: 0.9, coffee: 0.8, other: 0.85 }
const defaultSizes: Record<string, { label: string; shortLabel?: string; ml: number }[]> = {
  water: [{ label: 'Small Glass', shortLabel: 'Sml', ml: 200 }, { label: 'Reg. Glass', shortLabel: 'Reg', ml: 250 }, { label: 'Big Glass', shortLabel: 'Lrg', ml: 350 }, { label: 'Bottle', shortLabel: 'Bot', ml: 500 }],
  coffee: [{ label: 'Espresso', shortLabel: 'Esp', ml: 30 }, { label: 'Small Cup', shortLabel: 'Sml', ml: 150 }, { label: 'Reg. Cup', shortLabel: 'Reg', ml: 200 }, { label: 'Large Mug', shortLabel: 'Lrg', ml: 350 }],
  tea: [{ label: 'Small Cup', shortLabel: 'Sml', ml: 150 }, { label: 'Reg. Cup', shortLabel: 'Reg', ml: 200 }, { label: 'Large Mug', shortLabel: 'Lrg', ml: 300 }],
  juice: [{ label: 'Small Glass', shortLabel: 'Sml', ml: 150 }, { label: 'Reg. Glass', shortLabel: 'Reg', ml: 250 }, { label: 'Large Glass', shortLabel: 'Lrg', ml: 350 }],
  soda: [{ label: 'Can', shortLabel: 'Can', ml: 350 }, { label: 'Sml Bottle', shortLabel: 'Sml', ml: 500 }, { label: 'Lrg Bottle', shortLabel: 'Lrg', ml: 600 }],
  other: [{ label: 'Small', shortLabel: 'Sml', ml: 150 }, { label: 'Medium', shortLabel: 'Med', ml: 250 }, { label: 'Large', shortLabel: 'Lrg', ml: 350 }],
}
const currentSizes = computed(() => defaultSizes[selectedFluid.value] || defaultSizes.other)

function hydrationFactor(type: string) { return hydrationFactors[type] || 0.85 }

function getSizeScale(amountMl: number) {
  let scale = 0.9;
  if (amountMl <= 150) scale = 0.8;
  else if (amountMl >= 350) scale = 1.1;
  return scale;
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

async function addFluid(ml: number) {
  if (!ml || ml <= 0) return
  await $fetch('/api/fluids', {
    method: 'POST',
    body: {
      type: selectedFluid.value,
      subtype: selectedSubtype.value || null,
      amountMl: ml
    }
  })
  await refreshFluids(); await refreshAllFluids()
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
