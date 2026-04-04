<template>
  <div class="bg-surface font-body text-on-surface selection:bg-tertiary-container min-h-screen">
    <!-- Top Navigation (Mobile/Top Bar) -->
    <nav class="fixed top-0 w-full rounded-b-[3rem] z-50 bg-pink-100/70 backdrop-blur-xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] flex justify-between items-center px-6 md:px-10 py-4">
      <div class="text-2xl font-black text-primary flex items-center gap-2 font-headline tracking-tight">
        <span class="material-symbols-outlined scale-125" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        Yumi Fitness
      </div>
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed bg-primary/10 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">person</span>
        </div>
      </div>
    </nav>

    <!-- Magical Sidebar (Desktop) -->
    <MagicalSidebar />

    <!-- Main Content -->
    <slot />

    <!-- Global Panels -->
    <BreathingPanel />
    <ExercisePanel />
  </div>
</template>

<script setup lang="ts">
import MagicalSidebar from '~/components/layout/MagicalSidebar.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-body { font-family: 'Plus Jakarta Sans', sans-serif; }

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}
</style>
