<template>
  <div class="bg-card p-6 relative">
    <button @click="showBreathingHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Breathing History">
      <Icon :name="icons.clock" class="text-sm" />
    </button>
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Icon :name="icons.breathing" /> Breathing
    </h2>
    <!-- Pattern cards with descriptions -->
    <div class="space-y-2">
      <button v-for="pattern in breathingPatterns" :key="pattern.id" @click="openBreathingPanel(pattern)"
        class="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.01]" :style="{ background: 'var(--surface-light)', borderRadius: 'var(--radius)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">{{ pattern.name }}</p>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ pattern.helps }}</p>
          </div>
          <Icon :name="icons.breathing" class="text-lg" style="color: var(--text-muted)" />
        </div>
      </button>
    </div>

    <!-- Breathing History Modal -->
    <Transition name="slide">
      <div v-if="showBreathingHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showBreathingHistory = false">
        <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
              <Icon :name="icons.breathing" /> Breathing History
            </h3>
            <button @click="showBreathingHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
          </div>
          <div v-if="breathingHistory.length" class="space-y-2">
            <div v-for="entry in breathingHistory" :key="entry.id" class="flex items-center justify-between p-3 rounded-xl" style="background: var(--surface-light)">
              <div>
                <p class="text-sm font-medium">{{ entry.pattern }}</p>
                <p class="text-xs" style="color: var(--text-muted)">{{ formatDate(entry.date) }} · {{ formatDuration(entry.duration) }} · {{ entry.rounds }} rounds</p>
              </div>
              <button @click="deleteBreathing(entry.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
                <Icon :name="icons.close" class="text-xs" />
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No sessions yet!</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'
import { useBreathingPanel } from '~/composables/useBreathingPanel'

const emit = defineEmits<{
  openBreathing: [pattern: any]
}>()

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

function formatDuration(seconds: number) {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const { breathingPatterns, openBreathingPanel } = useBreathingPanel()

const showBreathingHistory = ref(false)
const { data: breathingHistoryData, refresh: refreshBreathing } = useFetch<any[]>('/api/breathing')
const breathingHistory = computed(() => breathingHistoryData.value || [])

async function deleteBreathing(id: number) {
  await $fetch(`/api/breathing?id=${id}`, { method: 'DELETE' })
  await refreshBreathing()
}
</script>
