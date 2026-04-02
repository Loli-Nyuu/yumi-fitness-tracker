<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">📏 Body Measurements</h1>

    <div v-if="latest" class="bg-card p-6">
      <h2 class="text-lg font-semibold mb-4">Latest ({{ latest.date }})</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="stat in bodyStats" :key="stat.label" class="text-center p-3 rounded-xl" style="background: var(--surface-light)">
          <p class="text-xs mb-1" style="color: var(--text-muted)">{{ stat.label }}</p>
          <p class="text-2xl font-bold" :style="{ color: stat.highlight ? 'var(--primary)' : 'inherit' }">{{ stat.value ?? '—' }}</p>
          <p v-if="stat.unit" class="text-xs" style="color: var(--text-muted)">{{ stat.unit }}</p>
        </div>
      </div>
    </div>

    <div class="bg-card p-6">
      <h2 class="text-lg font-semibold mb-4">Log New Measurement</h2>
      <form @submit.prevent="submit" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div v-for="field in fields" :key="field.key">
          <label class="text-sm" style="color: var(--text-muted)">{{ field.label }}</label>
          <input v-model.number="(form as any)[field.key]" type="number" step="0.1" :placeholder="field.placeholder"
            class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
        </div>
        <div class="col-span-2 sm:col-span-3">
          <button type="submit" :disabled="submitting" class="w-full py-3 font-bold rounded-xl transition-all" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
            {{ submitting ? 'Saving...' : '📏 Save Measurement' }}
          </button>
        </div>
      </form>
      <p v-if="successMsg" class="mt-2 text-sm" style="color: var(--success)">{{ successMsg }}</p>
    </div>

    <div v-if="history?.length" class="bg-card p-6">
      <h2 class="text-lg font-semibold mb-4">History</h2>
      <div class="space-y-2">
        <div v-for="m in history" :key="m.id" class="flex items-center justify-between p-3 rounded-lg" style="background: var(--surface-light)">
          <span class="text-sm" style="color: var(--text-muted)">{{ m.date }}</span>
          <div class="flex gap-4 text-sm">
            <span v-if="m.weight">{{ m.weight }} kg</span>
            <span v-if="m.waist">W: {{ m.waist }} cm</span>
            <span v-if="m.hip">H: {{ m.hip }} cm</span>
            <span v-if="m.whr" class="font-bold" style="color: var(--primary)">WHR: {{ m.whr.toFixed(3) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: latest, refresh: refreshLatest } = useFetch<any>('/api/body', { query: { latest: 'true' } })
const { data: history, refresh: refreshHistory } = useFetch<any[]>('/api/body')

const form = reactive({ weight: null, waist: null, hip: null, chest: null, thighLeft: null, thighRight: null } as any)
const submitting = ref(false)
const successMsg = ref('')

const fields = [
  { key: 'weight', label: 'Weight (kg)', placeholder: '68' },
  { key: 'waist', label: 'Waist (cm)', placeholder: '76' },
  { key: 'hip', label: 'Hip (cm)', placeholder: '88' },
  { key: 'chest', label: 'Chest (cm)', placeholder: '' },
  { key: 'thighLeft', label: 'Thigh Left (cm)', placeholder: '' },
  { key: 'thighRight', label: 'Thigh Right (cm)', placeholder: '' },
]

const bodyStats = computed(() => {
  const l = latest.value
  if (!l) return []
  return [
    { label: 'Weight', value: l.weight, unit: 'kg' },
    { label: 'Waist', value: l.waist, unit: 'cm' },
    { label: 'Hip', value: l.hip, unit: 'cm' },
    { label: 'WHR', value: l.whr, highlight: true },
    { label: 'Chest', value: l.chest, unit: 'cm' },
    { label: 'Thigh (L)', value: l.thighLeft, unit: 'cm' },
    { label: 'Thigh (R)', value: l.thighRight, unit: 'cm' },
    { label: 'Arm (L)', value: l.armLeft, unit: 'cm' },
  ]
})

async function submit() {
  submitting.value = true
  try {
    await $fetch('/api/body', { method: 'POST', body: form })
    successMsg.value = 'Measurement logged! 🍑'
    Object.assign(form, { weight: null, waist: null, hip: null, chest: null, thighLeft: null, thighRight: null })
    await Promise.all([refreshLatest(), refreshHistory()])
    setTimeout(() => successMsg.value = '', 3000)
  } catch { successMsg.value = 'Error saving!' }
  submitting.value = false
}
</script>
