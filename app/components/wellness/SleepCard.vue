<template>
  <div class="bg-card p-6 relative">
    <button @click="showSleepHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Sleep History">
      <Icon :name="icons.clock" class="text-sm" />
    </button>
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Icon :name="icons.sleep" /> Sleep
    </h2>
    <form @submit.prevent="logSleep" class="space-y-3 mb-4">
      <div class="flex gap-2">
        <button type="button" @click="sleepForm.sleepType = 'sleep'"
          class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          :style="sleepForm.sleepType === 'sleep'
            ? { background: 'var(--primary)', color: 'var(--background)' }
            : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
          <Icon :name="icons.sleep" /> Sleep
        </button>
        <button type="button" @click="sleepForm.sleepType = 'nap'"
          class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          :style="sleepForm.sleepType === 'nap'
            ? { background: 'var(--primary)', color: 'var(--background)' }
            : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
          <Icon :name="icons.clock" /> Nap
        </button>
      </div>
      <div>
        <label class="text-sm" style="color: var(--text-muted)">Quality (1-5)</label>
        <div class="flex gap-2 mt-1">
          <button v-for="i in 5" :key="i" type="button" @click="sleepForm.quality = i" class="text-2xl transition-all"
            :style="{ opacity: i <= sleepForm.quality ? '1' : '0.3', transform: i <= sleepForm.quality ? 'scale(1.1)' : 'scale(1)' }">
            <Icon :name="icons.star" :style="{ color: 'var(--accent)' }" />
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Hours</label>
          <input v-model.number="sleepForm.hours" type="number" step="0.5" placeholder="7" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Date</label>
          <input v-model="sleepForm.date" type="date" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
      </div>
      <button type="submit" class="w-full py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
        <Icon :name="icons.complete" /> Log Sleep
      </button>
    </form>
    <!-- Sleep History Modal -->
    <Transition name="slide">
      <div v-if="showSleepHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showSleepHistory = false">
        <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
              <Icon :name="icons.sleep" /> Sleep History
            </h3>
            <button @click="showSleepHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
          </div>
          <div v-if="sleepHistory.length" class="space-y-2">
            <div v-for="group in sleepHistoryGrouped" :key="group.date" class="p-3 rounded-xl" style="background: var(--surface-light)">
              <p class="text-sm font-medium mb-2">{{ formatDate(group.date) }}</p>
              <div v-for="entry in group.entries" :key="entry.id" class="flex items-center justify-between p-2 rounded-lg mb-1" style="background: var(--surface)">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-1.5 py-0.5 rounded-full" :style="(entry.sleepType || 'sleep') === 'nap'
                    ? { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }
                    : { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' }">
                    {{ (entry.sleepType || 'sleep') === 'nap' ? 'Nap' : 'Sleep' }}
                  </span>
                  <span class="text-sm">{{ entry.hours }}h</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex gap-0.5">
                    <Icon v-for="i in 5" :key="i" :name="icons.star" class="text-sm"
                      :style="{ opacity: i <= entry.quality ? '1' : '0.2', color: 'var(--accent)' }" />
                  </div>
                  <button @click="deleteSleep(entry.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
                    <Icon :name="icons.close" class="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No sleep logged yet!</p>
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

const { data: sleepData, refresh: refreshSleep } = useFetch<any>('/api/sleep')
const sleepHistory = computed(() => { const d = sleepData.value; return !d ? [] : Array.isArray(d) ? d : d.entries || [] })
const sleepHistoryGrouped = computed(() => {
  const byDate: Record<string, { date: string; entries: any[] }> = {}
  for (const e of sleepHistory.value) { if (!byDate[e.date]) byDate[e.date] = { date: e.date, entries: [] }; byDate[e.date].entries.push(e) }
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date))
})
const showSleepHistory = ref(false)
const todayStr = import.meta.client ? new Date().toISOString().split('T')[0] : '2026-04-02'
const sleepForm = reactive({ sleepType: 'sleep', quality: 3, hours: null as number | null, date: todayStr })
async function logSleep() {
  await $fetch('/api/sleep', { method: 'POST', body: sleepForm })
  sleepForm.sleepType = 'sleep'; sleepForm.quality = 3; sleepForm.hours = null; sleepForm.date = new Date().toISOString().split('T')[0]
  await refreshSleep()
}
async function deleteSleep(id: number) { await $fetch(`/api/sleep?id=${id}`, { method: 'DELETE' }); await refreshSleep() }
</script>
