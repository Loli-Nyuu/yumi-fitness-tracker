<template>
  <aside class="hidden lg:flex flex-col gap-2 p-6 w-72 h-screen fixed left-0 top-0 bg-[#fef4f6] rounded-r-[4rem] shadow-xl shadow-pink-200/20 z-40 pt-28">
    <!-- Profile Section -->
    <div class="flex items-center gap-4 mb-8 px-2">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-2 border-tertiary-container bg-primary-fixed flex items-center justify-center text-white overflow-hidden">
          <span class="material-symbols-outlined text-2xl">face</span>
        </div>
        <div class="absolute -top-1 -right-1 bg-tertiary-container text-white rounded-full p-0.5 scale-75">
          <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">star</span>
        </div>
      </div>
      <div>
        <h3 class="font-headline font-bold text-primary">Princess Yumi</h3>
        <p class="text-xs text-on-surface-variant font-medium">Level 5 Magical Girl</p>
      </div>
    </div>

    <!-- Navigation Links -->
    <div class="flex flex-col gap-1 flex-1">
      <NuxtLink 
        v-for="link in links" 
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300"
        :class="isActive(link.to) 
          ? 'bg-gradient-to-br from-pink-300 to-pink-200 text-white shadow-inner scale-95' 
          : 'text-pink-400 hover:text-pink-600 hover:translate-x-1'"
      >
        <span 
          class="material-symbols-outlined" 
          :style="getIconStyle(link.to)"
        >
          {{ link.icon }}
        </span>
        <span class="text-sm font-medium">{{ link.label }}</span>
      </NuxtLink>
    </div>

    <!-- Start Workout Button -->
    <button class="mt-auto mb-4 mx-2 ribbon-gradient text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">bolt</span>
      Start Workout
    </button>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const links = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/sessions', label: 'My Sessions', icon: 'calendar_month' },
  { to: '/live', label: 'Live', icon: 'live_tv' },
  { to: '/exercises', label: 'Exercises', icon: 'fitness_center' },
  { to: '/body', label: 'Body Stats', icon: 'monitoring' },
  { to: '/wellness', label: 'Wellness', icon: 'self_care' },
  { to: '/goals', label: 'Goals', icon: 'flag' },
  { to: '/timer', label: 'Timer', icon: 'timer' },
]

function isActive(path: string) {
  return route.path === path || (path !== '/' && route.path.startsWith(path))
}

function getIconStyle(path: string) {
  return isActive(path) ? { 'font-variation-settings': '"FILL" 1' } : {}
}
</script>

<style scoped>
.font-headline { font-family: var(--font-headline); }
</style>
