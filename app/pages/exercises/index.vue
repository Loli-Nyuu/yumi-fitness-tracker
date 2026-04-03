<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">📚 Exercise Library</h1>

    <div class="flex flex-wrap gap-2">
      <select v-model="filterCategory" class="px-3 py-2 rounded-xl text-sm" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)">
        <option value="">All Categories</option>
        <option value="glutes">🍑 Glutes</option>
        <option value="legs">🦵 Legs</option>
        <option value="core">💪 Core</option>
        <option value="flexibility">🧘 Flexibility</option>
      </select>
      <select v-model="filterPreference" class="px-3 py-2 rounded-xl text-sm" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)">
        <option value="">All Preferences</option>
        <option value="loved">❤️ Loved</option>
        <option value="ok">👍 OK</option>
        <option value="hated">👎 Hated</option>
        <option value="untested">🆕 Untested</option>
      </select>
      <label class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer" style="background: var(--surface); border: 1px solid var(--border)">
        <input type="checkbox" v-model="ankleSafeOnly" class="accent-[var(--primary)]" />
        <span style="color: var(--text-muted)">🦶 Ankle Safe</span>
      </label>
    </div>

    <div v-if="pending" class="text-center py-12">
      <div class="text-4xl animate-bounce">📚</div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="exercise in filtered" :key="exercise.id"
        @click="openExercisePanel(exercise)"
        class="bg-card p-5 hover:glow-primary transition-all cursor-pointer">
        <!-- GIF Preview -->
        <div v-if="exercise.gifUrl" class="mb-3 rounded-lg overflow-hidden aspect-video flex items-center justify-center" :style="{ background: 'var(--surface-light)', borderRadius: 'var(--radius-sm)' }">
          <img :src="exercise.gifUrl" :alt="exercise.name" class="max-h-full object-contain" loading="lazy" />
        </div>
        <div v-else class="mb-3 rounded-lg aspect-video flex items-center justify-center text-4xl" :style="{ background: 'var(--surface-light)', borderRadius: 'var(--radius-sm)' }">
          {{ categoryIcon(exercise.category) }}
        </div>

        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-lg">{{ exercise.name }}</h3>
          <span class="text-lg">{{ preferenceIcon(exercise.preference) }}</span>
        </div>

        <p class="text-sm mb-2" style="color: var(--text-muted)">
          {{ categoryIcon(exercise.category) }} {{ exercise.category }} · {{ exercise.musclePrimary }}
        </p>

        <p class="text-sm italic" style="color: var(--primary); opacity: 0.8">{{ exercise.kidFriendlyTip }}</p>

        <div class="flex flex-wrap gap-1 mt-3">
          <span v-if="exercise.isAnkleSafe" class="px-2 py-0.5 text-xs rounded-full" style="background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success)">🦶 Ankle Safe</span>
          <span class="px-2 py-0.5 text-xs rounded-full" style="background: var(--surface-light); color: var(--text-muted)">{{ exercise.equipment }}</span>
          <span v-if="exercise.preference === 'hated'" class="px-2 py-0.5 text-xs rounded-full" style="background: color-mix(in srgb, var(--danger) 15%, transparent); color: var(--danger)">❌ Do Not Program</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'
import { useExercisePanel } from '~/composables/useExercisePanel'

const { data, pending } = useFetch('/api/exercises')
const { openExercisePanel } = useExercisePanel()

const filterCategory = ref('')
const filterPreference = ref('')
const ankleSafeOnly = ref(false)

const filtered = computed(() => {
  if (!data.value) return []
  return data.value.filter(e => {
    if (filterCategory.value && e.category !== filterCategory.value) return false
    if (filterPreference.value && e.preference !== filterPreference.value) return false
    if (ankleSafeOnly.value && !e.isAnkleSafe) return false
    return true
  })
})

function categoryIcon(cat: string) {
  const icons: Record<string, string> = { glutes: '🍑', legs: '🦵', core: '💪', flexibility: '🧘', cardio: '🏃', breathing: '🫁' }
  return icons[cat] || '🏋️'
}

function preferenceIcon(pref: string) {
  const icons: Record<string, string> = { loved: '❤️', ok: '👍', hated: '👎', untested: '🆕' }
  return icons[pref] || '❓'
}
</script>
