<template>
  <div class="absolute pointer-events-none sparkle-container" :style="{ top, left, animationDelay, color }">
    <span class="material-symbols-outlined sparkle-icon text-2xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  top: { type: String, default: '50%' },
  left: { type: String, default: '50%' },
  color: { type: String, default: '#ffbcd9' },
  animationDelay: { type: String, default: '0s' }
})
</script>

<style scoped>
@keyframes sparkle-anim {
  0%, 100% { transform: scale(0.5) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
}

.sparkle-container {
  animation: sparkle-anim 3s ease-in-out infinite;
}
</style>