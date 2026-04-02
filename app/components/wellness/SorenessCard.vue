<template>
  <div class="bg-card p-6 relative">
    <button @click="showSorenessHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Soreness History">
      <Icon :name="icons.clock" class="text-sm" />
    </button>
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Icon :name="icons.soreness" /> Soreness
    </h2>
    <p class="text-xs mb-3" style="color: var(--text-muted)">Set each area, then submit.</p>
    <div class="space-y-2">
      <div v-for="part in bodyParts" :key="part.value" class="flex items-center justify-between p-2.5 rounded-lg" style="background: var(--surface-light)">
        <span class="text-sm font-medium">{{ part.label }}</span>
        <div class="flex gap-1">
          <button v-for="i in [0,1,2,3,4,5]" :key="i" @click="sorenessDraft[part.value] = i"
            class="w-7 h-7 rounded-lg text-xs font-bold transition-all"
            :style="draftButtonStyle(part.value, i)">{{ i }}</button>
        </div>
      </div>
    </div>
    <button @click="submitSoreness" :disabled="!sorenessDirty"
      class="w-full mt-4 py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30"
      :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
      <Icon :name="icons.complete" /> {{ sorenessSubmitting ? 'Saving...' : 'Set Soreness' }}
    </button>
    <!-- Soreness History Modal -->
    <Transition name="slide">
      <div v-if="showSorenessHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showSorenessHistory = false">
        <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
              <Icon :name="icons.soreness" /> Soreness History
            </h3>
            <button @click="showSorenessHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
          </div>
          <div v-if="Object.keys(sorenessHistoryGrouped).length" class="space-y-2">
            <div v-for="(group, date) in sorenessHistoryGrouped" :key="date" class="p-3 rounded-xl" style="background: var(--surface-light)">
              <p class="text-sm font-medium mb-2">{{ formatDate(date as string) }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(sev, part) in group" :key="part" class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :style="{ background: sorenessColorBg(sev as number), color: sorenessColorFg(sev as number) }">
                  {{ bodyPartEmoji(part as string) }} {{ part }}: {{ sev }}
                </span>
              </div>
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

const bodyParts = [
  { value: 'glutes', label: '🍑 Glutes' }, { value: 'quads', label: '🦵 Quads' },
  { value: 'hamstrings', label: '🦿 Hamstrings' }, { value: 'core', label: '💪 Core' },
  { value: 'back', label: '🔙 Back' }, { value: 'ankles', label: '🦶 Ankles' },
]
const sorenessDraft = ref<Record<string, number>>({ glutes: 0, quads: 0, hamstrings: 0, core: 0, back: 0, ankles: 0 })
const sorenessDirty = ref(false)
const sorenessSubmitting = ref(false)
const showSorenessHistory = ref(false)

const { data: sorenessData } = useFetch<any>('/api/soreness')

if (import.meta.client) {
  onMounted(async () => {
    try {
      const data = await $fetch<Record<string, { id: number; severity: number }>>('/api/soreness')
      for (const p of bodyParts) sorenessDraft.value[p.value] = data?.[p.value]?.severity || 0
    } catch {}
  })
}
watch(sorenessDraft, () => { sorenessDirty.value = true }, { deep: true })

function draftButtonStyle(partValue: string, severity: number) {
  const current = sorenessDraft.value[partValue] || 0; const isSelected = current === severity
  const colors = ['var(--text-muted)', 'var(--success)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--danger)']
  const bgs = ['transparent', 'color-mix(in srgb, var(--success) 20%, transparent)', 'color-mix(in srgb, var(--success) 30%, transparent)', 'color-mix(in srgb, var(--warning) 20%, transparent)', 'color-mix(in srgb, var(--danger) 20%, transparent)', 'color-mix(in srgb, var(--danger) 30%, transparent)']
  return { background: isSelected && severity > 0 ? colors[severity] : bgs[severity], color: isSelected ? (severity === 0 ? 'var(--text)' : 'var(--background)') : colors[severity], borderRadius: 'var(--radius-sm)', boxShadow: isSelected && severity > 0 ? '0 0 8px ' + colors[severity] : 'none', border: severity === 0 ? '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)') : 'none' }
}

async function submitSoreness() {
  sorenessSubmitting.value = true
  const entriesArr = bodyParts.map(p => ({ bodyPart: p.value, severity: sorenessDraft.value[p.value] || 0 }))
  const result = await $fetch('/api/soreness', { method: 'POST', body: { entries: entriesArr } })
  for (const p of bodyParts) sorenessDraft.value[p.value] = (result as any)?.[p.value]?.severity || 0
  sorenessDirty.value = false; sorenessSubmitting.value = false; await refreshSorenessHistory()
}

const { data: sorenessHistoryData, refresh: refreshSorenessHistory } = useFetch<any[]>('/api/soreness?date=all')
const sorenessHistory = computed(() => sorenessHistoryData.value || [])
const sorenessHistoryGrouped = computed(() => {
  const byDate: Record<string, Record<string, number>> = {}
  for (const e of sorenessHistory.value) { if (!byDate[e.date]) byDate[e.date] = {}; byDate[e.date][e.bodyPart] = e.severity }
  return Object.fromEntries(Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])))
})
const bodyPartEmojis: Record<string, string> = { glutes: '🍑', quads: '🦵', hamstrings: '🦿', core: '💪', back: '🔙', ankles: '🦶' }
function bodyPartEmoji(part: string) { return bodyPartEmojis[part] || '📍' }
function sorenessColorBg(sev: number) { return sev <= 2 ? 'color-mix(in srgb, var(--success) 20%, transparent)' : sev <= 3 ? 'color-mix(in srgb, var(--warning) 20%, transparent)' : 'color-mix(in srgb, var(--danger) 20%, transparent)' }
function sorenessColorFg(sev: number) { return sev <= 2 ? 'var(--success)' : sev <= 3 ? 'var(--warning)' : 'var(--danger)' }
</script>
