<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">🏋️ Sessions</h1>

    <div v-if="pending" class="text-center py-12"><div class="text-4xl animate-bounce">🏋️</div></div>

    <div v-else-if="data?.length" class="space-y-3">
      <div v-for="session in data" :key="session.id" class="bg-card p-5 flex items-center justify-between hover:glow-primary transition-all cursor-pointer" @click="navigateTo(`/sessions/${session.id}`)">
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ typeIcon(session.type) }}</span>
          <div>
            <p class="font-semibold">{{ formatDate(session.date) }}</p>
            <p class="text-sm" style="color: var(--text-muted)">{{ session.type }} session</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="session.durationActual" class="text-sm" style="color: var(--text-muted)">{{ session.durationActual }} min</span>
          <span class="px-3 py-1 rounded-full text-xs font-bold" :style="statusStyle(session.status)">{{ session.status }}</span>
        </div>
      </div>
    </div>

    <div v-else class="bg-card p-12 text-center">
      <div class="text-6xl mb-4">🏋️</div>
      <h2 class="text-xl font-semibold mb-2">No Sessions Yet</h2>
      <p style="color: var(--text-muted)">Start your first training session from the Dashboard!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending } = useFetch('/api/sessions')

function typeIcon(type: string) { return ({ morning: '🌅', afternoon: '☀️', evening: '🌙', full: '💪' } as any)[type] || '🏋️' }

function statusStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    planned: { bg: 'color-mix(in srgb, var(--info) 20%, transparent)', color: 'var(--info)' },
    in_progress: { bg: 'color-mix(in srgb, var(--warning) 20%, transparent)', color: 'var(--warning)' },
    completed: { bg: 'color-mix(in srgb, var(--success) 20%, transparent)', color: 'var(--success)' },
    skipped: { bg: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' },
  }
  const s = map[status] || { bg: 'var(--surface-light)', color: 'var(--text-muted)' }
  return { background: s.bg, color: s.color }
}

function formatDate(dateStr: string) { return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
</script>
