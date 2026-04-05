<template>
  <div class="bg-surface-container-lowest p-6 relative rounded-2xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] magical-glow transition-all duration-300 hover:scale-[1.01]">
    <button @click="showSorenessHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Soreness History">
      <Icon name="material-symbols:nest-clock-farsight-analog-outline-rounded" class="text-sm" />
    </button>
    <h2 class="text-2xl font-headline text-primary mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-[#ffb6c1]">healing</span> Muscle Recovery
    </h2>
    <p class="text-xs mb-4 font-medium text-on-surface-variant/70 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 text-center">
      Tap the numbers to log your soreness level (0-5)
    </p>
    <div class="space-y-3">
      <div v-for="part in bodyParts" :key="part.value" 
        class="flex items-center justify-between p-3 rounded-xl transition-all border border-outline-variant/10 bg-surface-container-lowest">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <span class="material-symbols-outlined text-sm">{{ part.icon }}</span>
          </div>
          <span class="text-sm font-bold capitalize text-on-surface">{{ part.label }}</span>
        </div>
        <div class="flex gap-1.5">
          <button v-for="i in [0,1,2,3,4,5]" :key="i" @click="sorenessDraft[part.value] = i"
            class="w-9 h-9 rounded-full text-xs font-black transition-all flex items-center justify-center border-2"
            :class="sorenessDraft[part.value] === i ? 'scale-110 ring-2 ring-offset-1 ring-offset-surface-container-lowest' : ''"
            :style="getSorenessColor(i, sorenessDraft[part.value] === i)">
            {{ i }}
          </button>
        </div>
      </div>
    </div>
    <button @click="submitSoreness" :disabled="!sorenessDirty"
      class="w-full mt-4 py-3 font-semibold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-30" 
      style="background: linear-gradient(135deg, #ff6ea9 0%, #b30065 100%); color: white; border-radius: 9999px; box-shadow: 0 4px 12px rgba(179, 0, 101, 0.3);">
      <Icon name="material-symbols:done-rounded" /> {{ sorenessSubmitting ? 'Saving...' : 'Set Soreness' }}
    </button>
  </div>

  <!-- Soreness History Modal -->
  <MagicalModal v-model="showSorenessHistory" title="Soreness Journal" icon="healing">
    <div v-if="Object.keys(sorenessHistoryGrouped).length" class="space-y-3">
      <div v-for="(group, date) in sorenessHistoryGrouped" :key="date" class="p-4 rounded-2xl bg-surface border border-outline-variant/20">
        <p class="text-sm font-bold mb-3 text-primary">{{ formatDate(date as string) }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="(sev, part) in group" :key="part" class="text-xs px-2.5 py-1 rounded-full font-bold border"
            :style="sorenessStyle(sev as number)">
            {{ bodyPartEmoji(part as string) }} {{ part }}: {{ sev }}
          </span>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-center py-6 text-on-surface-variant/70">No soreness data yet! 💪</p>
  </MagicalModal>
</template>

<script setup lang="ts">
const bodyParts = [
  { value: 'glutes', label: 'Glutes', icon: 'accessibility_new' }, 
  { value: 'quads', label: 'Quads', icon: 'hiking' },
  { value: 'hamstrings', label: 'Hamstrings', icon: 'directions_run' }, 
  { value: 'core', label: 'Core', icon: 'fitness_center' },
  { value: 'back', label: 'Back', icon: 'back_hand' }, 
  { value: 'ankles', label: 'Ankles', icon: 'footprint' },
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

function getSorenessColor(severity: number, isSelected: boolean) {
  const colors = [
    { bg: 'var(--surface)', fg: 'var(--text-muted)', border: 'var(--border)' },
    { bg: 'var(--success)', fg: 'white', border: 'var(--success)' },
    { bg: 'var(--success)', fg: 'white', border: 'var(--success)' },
    { bg: 'var(--warning)', fg: 'white', border: 'var(--warning)' },
    { bg: 'var(--danger)', fg: 'white', border: 'var(--danger)' },
    { bg: 'var(--danger)', fg: 'white', border: 'var(--danger)' }
  ]
  
  const color = colors[severity]
  if (isSelected) {
    return { background: color.bg, color: color.fg, borderColor: color.border, boxShadow: `0 0 12px ${color.bg}` }
  } else {
    return { background: 'transparent', color: color.bg, borderColor: color.bg, opacity: 0.4 }
  }
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

function sorenessStyle(sev: number) {
  if (sev <= 1) return { background: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)', borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)' }
  if (sev <= 2) return { background: 'color-mix(in srgb, var(--success) 25%, transparent)', color: 'var(--success)', borderColor: 'color-mix(in srgb, var(--success) 40%, transparent)' }
  if (sev <= 3) return { background: 'color-mix(in srgb, var(--warning) 20%, transparent)', color: 'var(--warning)', borderColor: 'color-mix(in srgb, var(--warning) 40%, transparent)' }
  return { background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)', borderColor: 'color-mix(in srgb, var(--danger) 40%, transparent)' }
}
</script>
