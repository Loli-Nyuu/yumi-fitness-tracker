<template>
  <div class="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group shadow-[0px_10px_30px_rgba(125,78,88,0.08)]">
    <div class="absolute top-0 right-0 p-4 text-tertiary-container opacity-20">
      <span class="material-symbols-outlined text-8xl">auto_awesome</span>
    </div>
    
    <h3 class="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
      <span class="material-symbols-outlined">magic_button</span>
      Today's Ritual
    </h3>

    <!-- Progress Ring -->
    <div class="flex justify-center items-center py-4 relative">
      <svg class="w-48 h-48 transform -rotate-90">
        <circle class="text-surface-container-low" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-width="12"/>
        <circle class="text-tertiary-container" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-dasharray="552.92" stroke-dashoffset="138.23" stroke-linecap="round" stroke-width="12"/>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-4xl font-headline font-black text-primary">75%</span>
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Complete</span>
      </div>
    </div>

    <!-- Ritual List -->
    <div class="mt-8 flex flex-col gap-3">
      <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full px-5">
        <span class="text-sm font-medium text-on-surface">Morning Stretch</span>
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full px-5">
        <span class="text-sm font-medium text-on-surface">Magical Dance</span>
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-surface-container-low/50 rounded-full px-5 opacity-60">
        <span class="text-sm font-medium text-on-surface">Evening Calm</span>
        <span class="material-symbols-outlined text-outline-variant">circle</span>
      </div>
    </div>
  </div>
</template>
