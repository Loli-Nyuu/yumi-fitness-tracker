<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">🎯 Goals & Challenges</h1>

    <div class="space-y-4">
      <div v-for="goal in activeGoals" :key="goal.id" class="bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-lg mr-2">{{ goalIcon(goal.type) }}</span>
            <span class="font-semibold text-lg">{{ goal.description }}</span>
          </div>
          <span class="text-sm" style="color: var(--text-muted)">{{ goal.deadline || 'No deadline' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex-1 h-3 rounded-full overflow-hidden" style="background: var(--surface-light)">
            <div class="h-full rounded-full transition-all" :style="{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`, background: 'var(--gradient)' }" />
          </div>
          <span class="text-sm font-bold" style="color: var(--primary)">{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.targetUnit }}</span>
        </div>
      </div>
    </div>

    <div class="bg-card p-6">
      <h2 class="text-lg font-semibold mb-4">Create New Goal</h2>
      <form @submit.prevent="createGoal" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Type</label>
          <select v-model="form.type" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)">
            <option value="pr">🏆 Personal Record</option>
            <option value="consistency">📅 Consistency</option>
            <option value="measurement">📏 Body Measurement</option>
            <option value="flexibility">🧘 Flexibility</option>
            <option value="custom">✨ Custom</option>
          </select>
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Description</label>
          <input v-model="form.description" placeholder="60-sec wall sit" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Target Value</label>
          <input v-model.number="form.targetValue" type="number" placeholder="60" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Unit</label>
          <input v-model="form.targetUnit" placeholder="seconds" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Current Value</label>
          <input v-model.number="form.currentValue" type="number" placeholder="56" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-muted)">Deadline</label>
          <input v-model="form.deadline" type="date" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="w-full py-3 font-bold rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">🎯 Create Goal</button>
        </div>
      </form>
    </div>

    <div class="bg-card p-6">
      <h2 class="text-lg font-semibold mb-4">🏆 Achievements</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="achievement in achievements" :key="achievement.id"
          class="text-center p-4 rounded-xl transition-all"
          :class="achievement.unlockedAt ? 'pr-badge' : ''"
          :style="achievement.unlockedAt ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', boxShadow: '0 0 15px var(--glow)' } : { background: 'var(--surface-light)', opacity: '0.4' }">
          <div class="text-3xl mb-1" :class="{ grayscale: !achievement.unlockedAt }">{{ achievement.icon }}</div>
          <p class="text-sm font-semibold">{{ achievement.name }}</p>
          <p class="text-xs" style="color: var(--text-muted)">{{ achievement.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: goalsData, refresh } = useFetch<any[]>('/api/goals')
const { data: achievementsData } = useFetch<any[]>('/api/goals')

const activeGoals = computed(() => goalsData.value?.filter((g: any) => g.status === 'active') || [])
const achievements = computed(() => achievementsData.value || [])

const form = reactive({ type: 'pr', description: '', targetValue: 0, targetUnit: '', currentValue: 0, deadline: '' })

function goalIcon(type: string) { return ({ pr: '🏆', consistency: '📅', measurement: '📏', flexibility: '🧘', custom: '✨' } as any)[type] || '🎯' }

async function createGoal() {
  if (!form.description || !form.targetValue) return
  await $fetch('/api/goals', { method: 'POST', body: form })
  Object.assign(form, { type: 'pr', description: '', targetValue: 0, targetUnit: '', currentValue: 0, deadline: '' })
  await refresh()
}
</script>
