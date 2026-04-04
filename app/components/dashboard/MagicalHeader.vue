<template>
  <header class="mb-12 relative">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">Welcome Back, Princess!</h1>
        <p class="text-on-surface-variant text-lg">Your magical journey continues today. You're 3 stars away from Level 6!</p>
      </div>
      
      <!-- Daily Energy Card -->
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex items-center gap-4 relative overflow-hidden">
        <div class="absolute -top-4 -right-4 text-tertiary-container/30">
          <span class="material-symbols-outlined text-6xl">cloud</span>
        </div>
        <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">sunny</span>
        </div>
        <div>
          <p class="text-xs uppercase font-bold tracking-widest text-on-surface-variant">Daily Energy</p>
          <p class="text-2xl font-headline font-black text-primary">High Sparkle</p>
        </div>
      </div>
    </div>

    <!-- Decorative Ribbon SVG -->
    <div class="absolute -bottom-8 right-10 pointer-events-none opacity-40 md:opacity-100">
      <svg fill="none" viewBox="0 0 120 40" width="120" height="40">
        <path d="M10 20C30 5 90 5 110 20" stroke="#ffbcd9" stroke-linecap="round" stroke-width="4"/>
        <path d="M55 5L60 0L65 5L60 10L55 5Z" fill="#ffbcd9"/>
      </svg>
    </div>
  </header>
</template>
