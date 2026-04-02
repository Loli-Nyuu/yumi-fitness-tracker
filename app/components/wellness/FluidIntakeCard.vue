<template>
  <div class="bg-card p-6 md:col-span-2 relative">
    <button @click="showFluidHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Fluid History">
      <Icon :name="icons.clock" class="text-sm" />
    </button>
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Icon :name="icons.water" /> Fluid Intake
    </h2>
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <span class="text-3xl font-bold" style="color: var(--primary)">{{ summary.effectiveMl }}</span>
          <span class="text-lg" style="color: var(--text-muted)"> / {{ summary.targetMl }} ml</span>
        </div>
        <div class="text-right">
          <p class="text-sm" style="color: var(--text-muted)">Total: {{ summary.totalMl }} ml</p>
          <p class="text-xs" style="color: var(--text-muted)">Effective hydration</p>
        </div>
      </div>
      <div class="h-3 rounded-full overflow-hidden" style="background: var(--surface-light)">
        <div class="h-full rounded-full transition-all duration-500"
          :style="{ width: `${Math.min(summary.percentComplete, 100)}%`, background: 'var(--gradient)' }" />
      </div>
      <p class="text-xs mt-1" style="color: var(--text-muted)">{{ summary.percentComplete }}% of daily target</p>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      <div v-for="(data, type) in summary.byType" :key="type"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
        :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
        <Icon :name="fluidIcon(type)" class="text-base" />
        <span class="font-medium">{{ data.totalMl }} ml</span>
        <span style="color: var(--text-muted)">({{ Math.round(data.totalMl * hydrationFactor(type)) }} eff.)</span>
      </div>
      <div v-if="Object.keys(summary.byType).length === 0" class="text-sm" style="color: var(--text-muted)">
        No drinks logged today. Stay hydrated!
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <button v-for="type in fluidTypes" :key="type.id" @click="selectedFluid = type.id"
        class="p-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
        :style="selectedFluid === type.id
          ? { background: 'var(--primary)', color: 'var(--background)' }
          : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
        <Icon :name="type.icon" class="text-xl" />
        <span class="text-xs font-medium">{{ type.label }}</span>
      </button>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      <button v-for="size in currentSizes" :key="size.ml" @click="addFluid(size.ml)"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
        :style="{ background: 'var(--surface-light)', color: 'var(--text)', borderRadius: 'var(--radius-sm)' }">
        <Icon :name="icons.add" class="text-sm" />
        {{ size.label }}
        <span style="color: var(--text-muted)">({{ size.ml }}ml = {{ Math.round(size.ml * hydrationFactor(selectedFluid)) }} eff.)</span>
      </button>
    </div>
    <form @submit.prevent="addFluid(customAmount)" class="flex gap-2">
      <input v-model.number="customAmount" type="number" placeholder="Custom ml"
        class="flex-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
      <button type="submit" class="px-4 py-2 rounded-xl font-medium"
        :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
        <Icon :name="icons.add" /> Add
      </button>
    </form>
    <div v-if="groupedEntries.length" class="mt-4">
      <h3 class="text-sm font-semibold mb-2" style="color: var(--text-muted)">Today's Log</h3>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        <div v-for="group in groupedEntries" :key="group.key"
          class="flex items-center justify-between p-2.5 rounded-lg" style="background: var(--surface-light)">
          <div class="flex items-center gap-2.5">
            <Icon :name="fluidIcon(group.type)" class="text-lg" />
            <div>
              <span class="capitalize font-medium">{{ group.type }}</span>
              <span style="color: var(--text-muted)"> · {{ group.ml }}ml</span>
              <span v-if="group.count > 1" style="color: var(--text-muted)"> ×{{ group.count }}</span>
              <span class="text-xs ml-1" style="color: var(--primary)">
                = {{ Math.round(group.ml * group.count * hydrationFactor(group.type)) }} eff.
              </span>
            </div>
          </div>
          <button @click="removeFluid(group)" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
            <Icon :name="icons.close" class="text-xs" />
          </button>
        </div>
      </div>
    </div>
    <!-- Fluid History Modal -->
    <Transition name="slide">
      <div v-if="showFluidHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showFluidHistory = false">
        <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
              <Icon :name="icons.water" /> Fluid History
            </h3>
            <button @click="showFluidHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
          </div>
          <div v-if="fluidHistory.length" class="space-y-2">
            <div v-for="day in fluidHistory" :key="day.date" class="p-3 rounded-xl" style="background: var(--surface-light)">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">{{ formatDate(day.date) }}</p>
                <div class="text-right">
                  <span class="text-sm font-bold" style="color: var(--primary)">{{ day.effectiveMl }} eff.</span>
                  <span class="text-xs ml-1" style="color: var(--text-muted)">/ {{ day.totalMl }} ml</span>
                </div>
              </div>
              <div class="mt-2 h-2 rounded-full overflow-hidden" style="background: var(--border)">
                <div class="h-full rounded-full" :style="{ width: Math.min(Math.round(day.effectiveMl / 2500 * 100), 100) + '%', background: 'var(--gradient)' }" />
              </div>
              <p class="text-xs mt-1" style="color: var(--text-muted)">{{ day.count }} drinks · {{ Math.round(day.effectiveMl / 2500 * 100) }}% of target</p>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No history yet!</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
  window.addEventListener('theme-change', ((e: CustomEvent) => { currentTheme.value = e.detail.theme }) as EventListener)
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const { data: fluidData, refresh: refreshFluids } = useFetch<any>('/api/fluids')
const summary = computed(() => fluidData.value?.summary || { byType: {}, totalMl: 0, effectiveMl: 0, targetMl: 2500, percentComplete: 0 })
const entries = computed(() => fluidData.value?.entries || [])
const showFluidHistory = ref(false)
const { data: fluidHistoryData, refresh: refreshFluidHistory } = useFetch<any[]>('/api/fluids?date=all')
const fluidHistory = computed(() => fluidHistoryData.value || [])

interface FluidGroup { key: string; type: string; ml: number; count: number; ids: number[] }

const groupedEntries = computed<FluidGroup[]>(() => {
  const map = new Map<string, FluidGroup>()
  for (const entry of entries.value) {
    const key = `${entry.type}-${entry.amountMl}`
    if (!map.has(key)) map.set(key, { key, type: entry.type, ml: entry.amountMl, count: 0, ids: [] })
    const g = map.get(key)!; g.count++; g.ids.push(entry.id)
  }
  return Array.from(map.values())
})

async function removeFluid(group: FluidGroup) {
  await $fetch(`/api/fluids?id=${group.ids[group.ids.length - 1]}`, { method: 'DELETE' })
  await refreshFluids()
}

const selectedFluid = ref('water')
const customAmount = ref(250)
const fluidTypes = [
  { id: 'water', label: 'Water', icon: 'mdi:water' },
  { id: 'coffee', label: 'Coffee', icon: 'mdi:coffee' },
  { id: 'tea', label: 'Tea', icon: 'mdi:tea' },
  { id: 'juice', label: 'Juice', icon: 'mdi:fruit-citrus' },
  { id: 'soda', label: 'Soda', icon: 'mdi:bottle-soda' },
  { id: 'other', label: 'Other', icon: 'mdi:cup' },
]
const hydrationFactors: Record<string, number> = { water: 1.0, tea: 0.9, juice: 1.0, soda: 0.9, coffee: 0.8, other: 0.85 }
const defaultSizes: Record<string, { label: string; ml: number }[]> = {
  water: [{ label: 'Small glass', ml: 200 }, { label: 'Regular glass', ml: 250 }, { label: 'Big glass', ml: 350 }, { label: 'Bottle', ml: 500 }],
  coffee: [{ label: 'Espresso', ml: 30 }, { label: 'Small cup', ml: 150 }, { label: 'Regular cup', ml: 200 }, { label: 'Large mug', ml: 350 }],
  tea: [{ label: 'Small cup', ml: 150 }, { label: 'Regular cup', ml: 200 }, { label: 'Large mug', ml: 300 }],
  juice: [{ label: 'Small glass', ml: 150 }, { label: 'Regular glass', ml: 250 }, { label: 'Large glass', ml: 350 }],
  soda: [{ label: 'Can', ml: 350 }, { label: 'Small bottle', ml: 500 }, { label: 'Large bottle', ml: 600 }],
  other: [{ label: 'Small', ml: 150 }, { label: 'Medium', ml: 250 }, { label: 'Large', ml: 350 }],
}
const currentSizes = computed(() => defaultSizes[selectedFluid.value] || defaultSizes.other)
function fluidIcon(type: string) { return fluidTypes.find(f => f.id === type)?.icon || 'mdi:cup' }
function hydrationFactor(type: string) { return hydrationFactors[type] || 0.85 }
async function addFluid(ml: number) {
  if (!ml || ml <= 0) return
  await $fetch('/api/fluids', { method: 'POST', body: { type: selectedFluid.value, amountMl: ml } })
  await refreshFluids(); await refreshFluidHistory()
}
</script>
