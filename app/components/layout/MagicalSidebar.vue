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
      <NuxtLink to="/" class="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-pink-300 to-pink-200 text-white rounded-full shadow-inner transition-transform duration-300 scale-95">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
        <span class="text-sm font-medium">Dashboard</span>
      </NuxtLink>
      <NuxtLink to="/sessions" class="flex items-center gap-3 px-4 py-3 text-pink-400 hover:text-pink-600 hover:translate-x-1 transition-transform duration-300">
        <span class="material-symbols-outlined">calendar_month</span>
        <span class="text-sm font-medium">My Sessions</span>
      </NuxtLink>
      <NuxtLink to="/live" class="flex items-center gap-3 px-4 py-3 text-pink-400 hover:text-pink-600 hover:translate-x-1 transition-transform duration-300">
        <span class="material-symbols-outlined">live_tv</span>
        <span class="text-sm font-medium">Live</span>
      </NuxtLink>
      <NuxtLink to="/exercises" class="flex items-center gap-3 px-4 py-3 text-pink-400 hover:text-pink-600 hover:translate-x-1 transition-transform duration-300">
        <span class="material-symbols-outlined">fitness_center</span>
        <span class="text-sm font-medium">Exercises</span>
      </NuxtLink>
      <NuxtLink to="/body" class="flex items-center gap-3 px-4 py-3 text-pink-400 hover:text-pink-600 hover:translate-x-1 transition-transform duration-300">
        <span class="material-symbols-outlined">monitoring</span>
        <span class="text-sm font-medium">Body Stats</span>
      </NuxtLink>
      <NuxtLink to="/wellness" class="flex items-center gap-3 px-4 py-3 text-pink-400 hover:text-pink-600 hover:translate-x-1 transition-transform duration-300">
        <span class="material-symbols-outlined">self_care</span>
        <span class="text-sm font-medium">Wellness</span>
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
</script>

<style scoped>
.font-headline { font-family: var(--font-headline); }
</style>
