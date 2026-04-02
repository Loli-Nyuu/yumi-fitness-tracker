<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">Dashboard</h1>
        <p class="mt-1" style="color: var(--text-muted)">{{ greeting }}, Yuyu!</p>
      </div>
      <button v-if="!data?.today?.session" @click="startTodaySession"
        class="px-4 py-2 font-semibold rounded-xl transition-all flex items-center gap-2"
        :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
        <Icon :name="icons.start" />
        Start Today's Session
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <Icon :name="icons.logo" class="text-4xl animate-bounce" />
      <p class="mt-2" style="color: var(--text-muted)">Loading your gains...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="data" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Today's Session Card -->
      <div class="bg-card p-5 col-span-1 md:col-span-2">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.today" /> Today
        </h2>
        <div v-if="data.today.session" class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full text-xs font-bold"
            :style="{ background: statusBg(data.today.session.status), color: statusColor(data.today.session.status) }">
            {{ data.today.session.status }}
          </span>
          <span style="color: var(--text-muted)">{{ data.today.session.type }} session</span>
        </div>
        <div v-else style="color: var(--text-muted)">
          No session planned yet. Ready when you are!
        </div>
      </div>

      <!-- Water Card -->
      <div class="bg-card p-5">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.water" /> Water
        </h2>
        <div class="flex items-end gap-2">
          <span class="text-4xl font-bold" style="color: var(--primary)">{{ waterGlasses }}</span>
          <span class="mb-1" style="color: var(--text-muted)">/ {{ waterTarget }} glasses</span>
        </div>
        <div class="mt-3 h-2 rounded-full overflow-hidden" style="background: var(--surface-light)">
          <div class="h-full rounded-full transition-all"
            :style="{ width: `${Math.min((waterGlasses / waterTarget) * 100, 100)}%`, background: 'var(--gradient)' }" />
        </div>
      </div>

      <!-- PRs Card -->
      <div class="bg-card p-5 col-span-1 md:col-span-2">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.trophy" /> Personal Records
        </h2>
        <div v-if="data.prs.length" class="space-y-2">
          <div v-for="pr in data.prs.slice(0, 5)" :key="pr.id"
            class="flex items-center justify-between p-3 rounded-lg" style="background: var(--surface-light)">
            <span class="font-medium">{{ pr.exerciseName }}</span>
            <div class="flex items-center gap-2">
              <span class="font-bold" style="color: var(--primary)">{{ pr.value }} {{ pr.unit }}</span>
              <span class="text-xs" style="color: var(--text-muted)">{{ pr.date }}</span>
            </div>
          </div>
        </div>
        <p v-else style="color: var(--text-muted)">No PRs yet. Let's set some records!</p>
      </div>

      <!-- Body Stats Card -->
      <div class="bg-card p-5">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.measurement" /> Body
        </h2>
        <div v-if="data.latestMeasurement" class="space-y-2">
          <div v-if="data.latestMeasurement.weight" class="flex justify-between">
            <span style="color: var(--text-muted)">Weight</span>
            <span class="font-bold">{{ data.latestMeasurement.weight }} kg</span>
          </div>
          <div v-if="data.latestMeasurement.waist" class="flex justify-between">
            <span style="color: var(--text-muted)">Waist</span>
            <span class="font-bold">{{ data.latestMeasurement.waist }} cm</span>
          </div>
          <div v-if="data.latestMeasurement.hip" class="flex justify-between">
            <span style="color: var(--text-muted)">Hip</span>
            <span class="font-bold">{{ data.latestMeasurement.hip }} cm</span>
          </div>
          <div v-if="data.latestMeasurement.whr" class="flex justify-between">
            <span style="color: var(--text-muted)">WHR</span>
            <span class="font-bold" :style="{ color: whrColor(data.latestMeasurement.whr) }">
              {{ data.latestMeasurement.whr.toFixed(3) }}
            </span>
          </div>
        </div>
        <p v-else style="color: var(--text-muted)">No measurements yet.</p>
      </div>

      <!-- Weekly Stats -->
      <div class="bg-card p-5">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.stats" /> This Week
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span style="color: var(--text-muted)">Sessions completed</span>
            <span class="font-bold" style="color: var(--primary)">{{ data.stats.completedThisWeek }}</span>
          </div>
          <div class="flex justify-between">
            <span style="color: var(--text-muted)">Total sessions</span>
            <span class="font-bold">{{ data.stats.totalSessions }}</span>
          </div>
        </div>
      </div>

      <!-- Sleep Card -->
      <div class="bg-card p-5">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.sleep" /> Last Sleep
        </h2>
        <div v-if="data.lastSleep" class="space-y-2">
          <div class="flex items-center gap-1">
            <Icon v-for="i in 5" :key="i" :name="icons.star" class="text-xl"
              :style="{ opacity: i <= (data.lastSleep.quality || 0) ? '1' : '0.2', color: 'var(--accent)' }" />
          </div>
          <div v-if="data.lastSleep.hours" style="color: var(--text-muted)">
            {{ data.lastSleep.hours }} hours
          </div>
        </div>
        <p v-else style="color: var(--text-muted)">No sleep data yet.</p>
      </div>

      <!-- Active Goals -->
      <div class="bg-card p-5 col-span-1 md:col-span-2 lg:col-span-3">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon :name="icons.target" /> Active Goals
        </h2>
        <div v-if="data.activeGoals.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="goal in data.activeGoals" :key="goal.id" class="p-4 rounded-xl" style="background: var(--surface-light)">
            <p class="font-medium">{{ goal.description }}</p>
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: var(--background)">
                <div class="h-full rounded-full transition-all"
                  :style="{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`, background: 'var(--primary)' }" />
              </div>
              <span class="text-xs" style="color: var(--text-muted)">
                {{ goal.currentValue }}/{{ goal.targetValue }} {{ goal.targetUnit }}
              </span>
            </div>
          </div>
        </div>
        <p v-else style="color: var(--text-muted)">No active goals. Set one on the Goals page!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '../utils/theme-icons'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

// Sync theme from settings
onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
  window.addEventListener('theme-change', ((e: CustomEvent) => {
    currentTheme.value = e.detail.theme
  }) as EventListener)
})

const { data, pending } = useFetch<any>('/api/dashboard')

const waterGlasses = computed(() => (data.value?.today?.water as any)?.glasses || 0)
const waterTarget = computed(() => (data.value?.today?.water as any)?.target || 8)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

function statusBg(status: string) {
  const bgs: Record<string, string> = {
    planned: 'color-mix(in srgb, var(--info) 20%, transparent)',
    in_progress: 'color-mix(in srgb, var(--warning) 20%, transparent)',
    completed: 'color-mix(in srgb, var(--success) 20%, transparent)',
    skipped: 'color-mix(in srgb, var(--danger) 20%, transparent)',
  }
  return bgs[status] || 'var(--surface-light)'
}

function statusColor(status: string) {
  const colors: Record<string, string> = {
    planned: 'var(--info)', in_progress: 'var(--warning)',
    completed: 'var(--success)', skipped: 'var(--danger)',
  }
  return colors[status] || 'var(--text-muted)'
}

function whrColor(whr: number) {
  if (whr < 0.80) return 'var(--success)'
  if (whr < 0.85) return 'var(--warning)'
  return 'var(--text-muted)'
}

function startTodaySession() { navigateTo('/live') }
</script>
