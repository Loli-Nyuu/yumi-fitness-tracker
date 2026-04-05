<template>
  <div class="bg-surface-container-lowest p-6 relative rounded-2xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] magical-glow transition-all duration-300 hover:scale-[1.01]">
    <button @click="showSleepHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Sleep History">
      <Icon name="material-symbols:nest-clock-farsight-analog-outline-rounded" class="text-sm" />
    </button>
    <h2 class="text-2xl font-headline text-primary mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-[#ffb6c1]" style="font-variation-settings: 'FILL' 1;">bedtime</span> Dream Journal
    </h2>
    <form @submit.prevent="logSleep" class="space-y-3 mb-4">
      <div class="flex gap-2">
        <button type="button" @click="sleepForm.sleepType = 'sleep'"
          class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          :style="sleepForm.sleepType === 'sleep'
            ? { background: 'var(--primary)', color: 'var(--background)' }
            : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
          <Icon name="material-symbols:play-circle-outline-rounded" /> Sleep
        </button>
        <button type="button" @click="sleepForm.sleepType = 'nap'"
          class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          :style="sleepForm.sleepType === 'nap'
            ? { background: 'var(--primary)', color: 'var(--background)' }
            : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
          <Icon name="material-symbols:nest-clock-farsight-analog-outline-rounded" /> Nap
        </button>
      </div>
      <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 space-y-4">
        <div>
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block opacity-70">Dream Quality</label>
          <div class="flex justify-between gap-2">
            <button v-for="i in 5" :key="i" type="button" @click="sleepForm.quality = i" 
              class="aspect-square rounded-xl flex-1 flex items-center justify-center transition-all hover:scale-105"
              :style="i <= sleepForm.quality 
                ? { background: 'linear-gradient(135deg, #ff6ea9 0%, #b30065 100%)', boxShadow: '0 4px 12px rgba(179, 0, 101, 0.2)' }
                : { background: 'var(--surface)', opacity: 0.5 }">
              <span class="material-symbols-outlined text-white text-xl" :style="{ fontVariationSettings: i <= sleepForm.quality ? '\'FILL\' 1' : '\'FILL\' 0' }">star</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-on-surface-variant uppercase mb-1 block opacity-70">Hours</label>
            <input v-model.number="sleepForm.hours" type="number" step="0.5" placeholder="7.5" 
              class="w-full px-4 py-3 rounded-xl font-bold text-center border-2 border-outline-variant/30 focus:border-primary/50 outline-none transition-colors" 
              style="background: var(--surface); color: var(--text)" />
          </div>
          <div>
            <label class="text-xs font-bold text-on-surface-variant uppercase mb-1 block opacity-70">Date</label>
            <input v-model="sleepForm.date" type="date" 
              class="w-full px-4 py-3 rounded-xl font-medium text-center text-sm border-2 border-outline-variant/30 focus:border-primary/50 outline-none transition-colors" 
              style="background: var(--surface); color: var(--text)" />
          </div>
        </div>
      </div>
      <button type="submit" class="w-full py-3 font-semibold rounded-full transition-all flex items-center justify-center gap-2" style="background: linear-gradient(135deg, #ff6ea9 0%, #b30065 100%); color: white; border-radius: 9999px; box-shadow: 0 4px 12px rgba(179, 0, 101, 0.3);">
        <Icon name="material-symbols:done-rounded" /> Log Sleep
      </button>
    </form>
  </div>

  <!-- Sleep History Modal -->
  <MagicalModal v-model="showSleepHistory" title="Sleep History" icon="bedtime">
    <div v-if="sleepHistory.length" class="space-y-3">
      <div v-for="group in sleepHistoryGrouped" :key="group.date" class="p-4 rounded-2xl bg-surface border border-outline-variant/20">
        <p class="text-sm font-bold mb-3 text-primary">{{ formatDate(group.date) }}</p>
        <div v-for="entry in group.entries" :key="entry.id" class="flex items-center justify-between p-3 rounded-xl mb-2 bg-surface-container-lowest hover:scale-[1.02] transition-transform">
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold" :style="(entry.sleepType || 'sleep') === 'nap'
              ? { background: 'color-mix(in srgb, var(--tertiary-container) 40%, transparent)', color: 'var(--on-tertiary-container)' }
              : { background: 'color-mix(in srgb, var(--primary-container) 40%, transparent)', color: 'var(--on-primary-container)' }">
              {{ (entry.sleepType || 'sleep') === 'nap' ? 'Nap' : 'Sleep' }}
            </span>
            <span class="text-sm font-semibold">{{ entry.hours }}h</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              <Icon
                v-for="i in 5"
                :key="i"
                :name="i <= entry.quality ? 'material-symbols:family-star' : 'material-symbols:kid-star-outline'"
                class="text-sm"
                :style="{ opacity: i <= entry.quality ? '1' : '0.15', color: '#ffbcd9', filter: i <= entry.quality ? 'drop-shadow(0 0 4px #ffbcd9)' : 'none' }"
              />
            </div>
            <button @click="deleteSleep(entry.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-danger/10"
              style="color: var(--danger)">
              <Icon name="material-symbols:delete-forever-outline-rounded" class="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-center py-6 text-on-surface-variant/70">No magical dreams logged yet! 🌙</p>
  </MagicalModal>
</template>

<script setup lang="ts">

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
