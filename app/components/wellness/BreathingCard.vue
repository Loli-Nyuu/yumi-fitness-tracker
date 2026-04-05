<template>
  <div class="bg-surface-container-lowest p-6 relative rounded-2xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] magical-glow transition-all duration-300 hover:scale-[1.01]">
    <button @click="showBreathingHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Breathing History">
      <Icon name="material-symbols:nest-clock-farsight-analog-outline-rounded" class="text-sm" />
    </button>
    <h2 class="text-2xl font-headline text-primary mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-[#ffb6c1]" style="font-variation-settings: 'FILL' 1;">self_improvement</span> Breathwork
    </h2>
    
    <div class="space-y-3">
      <button v-for="pattern in breathingPatterns" :key="pattern.id" @click="openBreathingPanel(pattern)"
        class="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.02] group border border-outline-variant/20"
        :style="{ background: 'var(--surface-container-low)' }">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">{{ pattern.icon || 'air' }}</span>
          </div>
          <div class="flex-1">
            <p class="font-bold text-on-surface group-hover:text-primary transition-colors">{{ pattern.name }}</p>
            <p class="text-xs mt-1 font-medium text-on-surface-variant/70">{{ pattern.helps }}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Breathing History Modal -->
  <MagicalModal v-model="showBreathingHistory" title="Breath Journal" icon="self_improvement">
    <div v-if="breathingHistory.length" class="space-y-3">
      <div v-for="entry in breathingHistory" :key="entry.id" class="flex items-center justify-between p-4 rounded-xl bg-surface border border-outline-variant/20 hover:scale-[1.02] transition-transform">
        <div>
          <p class="text-sm font-bold text-primary">{{ entry.pattern }}</p>
          <p class="text-xs mt-1 text-on-surface-variant/70">{{ formatDate(entry.date) }} · {{ formatDuration(entry.duration) }} · {{ entry.rounds }} rounds</p>
        </div>
        <button @click="deleteBreathing(entry.id)" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-danger/10 hover:scale-110"
          style="color: var(--danger)">
          <Icon name="material-symbols:close-rounded" class="text-xs" />
        </button>
      </div>
    </div>
    <p v-else class="text-sm text-center py-6 text-on-surface-variant/70">No breathing sessions yet! 🍃</p>
  </MagicalModal>
</template>

<script setup lang="ts">
import { useBreathingPanel } from '~/composables/useBreathingPanel'

const emit = defineEmits<{
  openBreathing: [pattern: any]
}>()

const { breathingPatterns, openBreathingPanel } = useBreathingPanel()

const showBreathingHistory = ref(false)
const { data: breathingHistoryData, refresh: refreshBreathing } = useFetch<any[]>('/api/breathing')
const breathingHistory = computed(() => breathingHistoryData.value || [])

async function deleteBreathing(id: number) {
  await $fetch(`/api/breathing?id=${id}`, { method: 'DELETE' })
  await refreshBreathing()
}
</script>
