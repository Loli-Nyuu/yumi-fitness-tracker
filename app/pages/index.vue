<template>
  <div class="bg-surface min-h-screen pb-20">
    <!-- Main Content Canvas -->
    <main class="lg:ml-72 pt-24 px-6 md:px-12 pb-12">
      
      <!-- Header -->
      <MagicalHeader />

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Today's Ritual -->
        <div class="md:col-span-1">
          <TodaysRitual />
        </div>

        <!-- Strawberry Water Tracker -->
        <div class="md:col-span-2">
          <StrawberryWaterTracker />
        </div>

        <!-- More magical components will go here... -->
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import MagicalHeader from '~/components/dashboard/MagicalHeader.vue'
import TodaysRitual from '~/components/dashboard/TodaysRitual.vue'
import StrawberryWaterTracker from '~/components/dashboard/StrawberryWaterTracker.vue'
</script>
