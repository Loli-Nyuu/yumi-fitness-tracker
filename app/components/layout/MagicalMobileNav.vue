<template>
  <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl px-6 py-4 flex justify-between items-center z-50 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(125,78,88,0.05)]">
    <NuxtLink to="/" class="flex flex-col items-center gap-1 text-primary">
      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
      <span class="text-[10px] font-bold">Home</span>
    </NuxtLink>
    <NuxtLink to="/exercises" class="flex flex-col items-center gap-1 text-pink-300">
      <span class="material-symbols-outlined">fitness_center</span>
      <span class="text-[10px] font-bold">Workouts</span>
    </NuxtLink>
    
    <!-- Central "Magic Button" -->
    <div class="relative -top-8">
      <button class="w-14 h-14 ribbon-gradient rounded-full text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <span class="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>

    <NuxtLink to="/wellness" class="flex flex-col items-center gap-1 text-pink-300">
      <span class="material-symbols-outlined">favorite</span>
      <span class="text-[10px] font-bold">Health</span>
    </NuxtLink>
    <NuxtLink to="/body" class="flex flex-col items-center gap-1 text-pink-300">
      <span class="material-symbols-outlined">person</span>
      <span class="text-[10px] font-bold">Profile</span>
    </NuxtLink>
  </nav>
</template>
