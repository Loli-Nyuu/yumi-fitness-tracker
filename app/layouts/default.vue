<template>
  <div :data-theme="currentTheme" :data-mode="resolvedMode" class="min-h-screen" style="background: var(--background)">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 backdrop-blur-lg" style="background: color-mix(in srgb, var(--surface) 80%, transparent); border-bottom: 1px solid var(--border)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-2">
            <Icon :name="icons.logo" class="text-2xl" />
            <span class="text-lg font-bold text-gradient hidden sm:inline" style="font-family: var(--font-heading)">Yumi Fitness</span>
          </NuxtLink>

          <div class="hidden md:flex items-center gap-1">
            <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :style="isActive(item.path) ? { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' } : { color: 'var(--text-muted)' }">
              <Icon :name="item.icon" class="text-base" />
              {{ item.label }}
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2">
            <button @click="toggleColorMode" class="p-2 rounded-lg transition-all" style="color: var(--text-muted)" :title="'Mode: ' + currentMode">
              <Icon :name="modeIcon" class="text-xl" />
            </button>
            <button @click="showSettings = !showSettings" class="p-2 rounded-lg transition-all" style="color: var(--text-muted)">
              <Icon :name="icons.settings" class="text-xl" />
            </button>
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg" style="color: var(--text-muted)">
              <Icon :name="mobileMenuOpen ? icons.close : icons.menu" class="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden" style="border-top: 1px solid var(--border); background: var(--surface)">
        <div class="px-4 py-2 space-y-1">
          <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            :style="isActive(item.path) ? { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' } : { color: 'var(--text-muted)' }">
            <Icon :name="item.icon" class="text-base" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Settings Panel -->
    <Transition name="slide">
      <div v-if="showSettings" class="fixed inset-0 z-50 flex justify-end" @click.self="showSettings = false">
        <div class="w-full max-w-sm h-full overflow-y-auto p-6" style="background: var(--surface); border-left: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">⚙️ Settings</h2>
            <button @click="showSettings = false" class="text-2xl" style="color: var(--text-muted)">✕</button>
          </div>

          <div class="mb-6">
            <h3 class="text-sm font-semibold mb-3" style="color: var(--text-muted)">Color Mode</h3>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="mode in modes" :key="mode.value" @click="setColorMode(mode.value)"
                class="p-3 rounded-xl text-center transition-all text-sm font-medium"
                :style="currentMode === mode.value ? { background: 'var(--primary)', color: 'var(--background)' } : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
                <Icon :name="mode.icon" class="text-xl mb-1 block" />
                {{ mode.label }}
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold mb-3" style="color: var(--text-muted)">Theme</h3>
            <div class="space-y-2">
              <button v-for="theme in themes" :key="theme.id" @click="setTheme(theme.id)"
                class="w-full p-4 rounded-xl flex items-center gap-3 transition-all"
                :style="currentTheme === theme.id ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', border: '2px solid var(--primary)' } : { background: 'var(--surface-light)', border: '2px solid transparent' }">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl" :style="{ background: theme.preview }">
                  {{ theme.icon }}
                </div>
                <div class="text-left">
                  <p class="font-semibold">{{ theme.name }}</p>
                  <p class="text-xs" style="color: var(--text-muted)">{{ theme.description }}</p>
                </div>
                <div class="ml-auto flex gap-1">
                  <div v-for="color in theme.colors" :key="color" class="w-4 h-4 rounded-full" :style="{ background: color }" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <!-- Global Breathing Panel -->
    <BreathingPanel />
    <!-- Global Exercise Panel -->
    <ExercisePanel />
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '../utils/theme-icons'

const route = useRoute()
const mobileMenuOpen = ref(false)
const showSettings = ref(false)
const currentMode = ref('dark')
const currentTheme = ref('yumi')
const resolvedMode = ref<'light' | 'dark'>('dark')

const icons = computed(() => getIcons(currentTheme.value))

const navItems = computed(() => [
  { path: '/', label: 'Dashboard', icon: icons.value.dashboard },
  { path: '/sessions', label: 'Sessions', icon: icons.value.sessions },
  { path: '/live', label: 'Live', icon: icons.value.live },
  { path: '/exercises', label: 'Exercises', icon: icons.value.exercises },
  { path: '/body', label: 'Body', icon: icons.value.body },
  { path: '/wellness', label: 'Wellness', icon: icons.value.wellness },
  { path: '/goals', label: 'Goals', icon: icons.value.goals },
  { path: '/timer', label: 'Timer', icon: icons.value.timer },
])

const modes = computed(() => [
  { value: 'system', label: 'System', icon: icons.value.systemMode },
  { value: 'light', label: 'Light', icon: icons.value.lightMode },
  { value: 'dark', label: 'Dark', icon: icons.value.darkMode },
])

const themes = [
  { id: 'yumi', name: 'Yumi', icon: '🍑', description: 'Athletic, energetic, teal & coral', preview: '#00D4AA', colors: ['#00D4AA', '#FF6B6B', '#FFD93D'] },
  { id: 'madoka', name: 'Madoka', icon: '🌸', description: 'Magical girl, pink, sparkly, cute', preview: '#FF69B4', colors: ['#FF69B4', '#DA70D6', '#FFB6C1'] },
  { id: 'rem', name: 'Rem', icon: '💎', description: 'Elegant, blue, silver, precise', preview: '#5B9BD5', colors: ['#5B9BD5', '#C0C0C0', '#87CEEB'] },
  { id: 'zero-two', name: 'Zero Two', icon: '🔥', description: 'Bold, red, passionate, edgy', preview: '#E84057', colors: ['#E84057', '#FF8C94', '#FFB4B4'] },
]

const modeIcon = computed(() => currentMode.value === 'system' ? icons.value.systemMode : currentMode.value === 'dark' ? icons.value.darkMode : icons.value.lightMode)

function isActive(path: string) { return path === '/' ? route.path === '/' : route.path.startsWith(path) }

function resolveMode(mode: string): 'light' | 'dark' {
  if (mode === 'system') {
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  }
  return mode as 'light' | 'dark'
}

async function setColorMode(mode: string) {
  currentMode.value = mode
  resolvedMode.value = resolveMode(mode)
  await $fetch('/api/settings', { method: 'PATCH', body: { colorMode: mode } })
}

async function setTheme(themeId: string) {
  currentTheme.value = themeId
  await $fetch('/api/settings', { method: 'PATCH', body: { theme: themeId } })
}

function toggleColorMode() {
  const order = ['system', 'light', 'dark']
  const next = order[(order.indexOf(currentMode.value) + 1) % order.length]
  setColorMode(next)
}

// Initialize from server settings
onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings.theme || 'yumi'
    currentMode.value = settings.colorMode || 'system'
    resolvedMode.value = resolveMode(settings.colorMode || 'system')
  } catch {}

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentMode.value === 'system') {
      resolvedMode.value = resolveMode('system')
    }
  })
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; }
.slide-enter-from > div, .slide-leave-to > div { transform: translateX(100%); }
</style>
