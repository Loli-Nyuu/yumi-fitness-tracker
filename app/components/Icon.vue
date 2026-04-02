<template>
  <span class="inline-block text-center leading-none" :style="style">{{ emoji }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ name: string }>()

// Map icon names to emojis
const iconMap: Record<string, string> = {
  'mdi:view-dashboard': '📊', 'mdi:dumbbell': '🏋️', 'mdi:broadcast': '📡',
  'mdi:format-list-checks': '📋', 'mdi:ruler': '📏', 'mdi:heart-pulse': '💓',
  'mdi:target': '🎯', 'mdi:timer': '⏱️', 'mdi:cog': '⚙️',
  'mdi:calendar-check': '📅', 'mdi:water': '💧', 'mdi:trophy': '🏆',
  'mdi:chart-line': '📈', 'mdi:chart-pie': '📊', 'mdi:moon-waning-crescent': '🌙',
  'mdi:crosshairs': '🎯', 'mdi:medical-bag': '🩹', 'mdi:weather-windy': '💨',
  'mdi:silverware-fork-knife': '🍽️', 'mdi:play': '▶️', 'mdi:pause': '⏸️',
  'mdi:stop': '⏹️', 'mdi:refresh': '🔄', 'mdi:check-circle': '✅',
  'mdi:arrow-right': '➡️', 'mdi:coffee': '☕', 'mdi:wrench': '🔧',
  'mdi:plus-circle': '➕', 'mdi:check-circle': '✅', 'mdi:alert-circle': '⚠️',
  'mdi:close-circle': '❌', 'mdi:information': 'ℹ️', 'mdi:heart': '❤️',
  'mdi:white-balance-sunny': '☀️', 'mdi:laptop': '💻',
  'mdi:circle': '●', 'mdi:walk': '🚶', 'mdi:shield': '🛡️',
  'mdi:yoga': '🧘', 'mdi:star': '⭐', 'mdi:magnify': '🔍',
  'mdi:close': '✕', 'mdi:menu': '☰', 'mdi:fire': '🔥',
  'mdi:cards-heart': '❤️', 'mdi:clock-outline': '🕐',
  // Madoka
  'mdi:view-dashboard': '📊', 'mdi:flower-tulip': '🌸',
  'mdi:weather-sunny': '☀️', 'mdi:weather-night': '🌙',
  'mdi:tea': '🍵', 'mdi:fruit-citrus': '🍊', 'mdi:bottle-soda': '🥤',
  'mdi:cup': '🥤', 'mdi:alarm': '⏰',
  // Rem
  'mdi:view-dashboard-outline': '📊', 'mdi:heart-outline': '❤️',
  'mdi:diamond-stone': '💎', 'mdi:play-outline': '▶️',
  'mdi:pause-outline': '⏸️', 'mdi:stop-outline': '⏹️',
  'mdi:restore': '🔄', 'mdi:check-circle-outline': '✅',
  'mdi:skip-next': '⏭️', 'mdi:coffee-outline': '☕',
  'mdi:square-edit-outline': '✏️', 'mdi:plus-circle-outline': '➕',
  'mdi:alert-outline': '⚠️', 'mdi:close-circle-outline': '❌',
  'mdi:information-outline': 'ℹ️', 'mdi:star-outline': '⭐',
  'mdi:shield-outline': '🛡️', 'mdi:meditation': '🧘',
  'mdi:calendar-outline': '📅', 'mdi:water-outline': '💧',
  'mdi:trophy-outline': '🏆', 'mdi:power-sleep': '😴',
  'mdi:timer-outline': '⏱️', 'mdi:cog-outline': '⚙️',
  'mdi:video-outline': '📹', 'mdi:chart-bar': '📊',
  'mdi:heart-pulse': '💓',
  // Zero Two
  'mdi:arm-flex': '💪', 'mdi:clipboard-check': '✅',
  'mdi:account': '👤', 'mdi:heart-flash': '⚡',
  'mdi:sword-cross': '⚔️', 'mdi:chili-hot': '🌶️',
  'mdi:moon-waxing-crescent': '🌙', 'mdi:desktop-mac-dashboard': '💻',
  'mdi:lightning-bolt': '⚡', 'mdi:scope': '🎯',
  'mdi:needle': '💉', 'mdi:lungs': '🫁',
  'mdi:food-drumstick': '🍗', 'mdi:play': '▶️',
  'mdi:pause': '⏸️', 'mdi:stop': '⏹️', 'mdi:reload': '🔄',
  'mdi:check-bold': '✅', 'mdi:skip-next': '⏭️',
  'mdi:wrench': '🔧', 'mdi:plus': '➕',
  'mdi:alert': '⚠️', 'mdi:close-thick': '❌',
  'mdi:information': 'ℹ️',
  'mdi:star-four-points': '✨', 'mdi:run-fast': '🏃',
  'mdi:shield-star': '⭐', 'mdi:clock-fast': '⏱️',
  'mdi:chili-hot': '🌶️',
}

const emoji = computed(() => iconMap[props.name] || '●')

const style = computed(() => ({
  fontSize: 'inherit',
  color: 'inherit',
}))
</script>
