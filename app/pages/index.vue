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

        <!-- Personal Records -->
        <div class="md:col-span-2">
          <PRCard />
        </div>

        <!-- Weekly Stats -->
        <div class="md:col-span-1">
          <WeeklyStatsCard />
        </div>
        
        <!-- Body Stats -->
        <div class="md:col-span-1">
          <BodyStatsCard />
        </div>

        <!-- Sleep -->
        <div class="md:col-span-1">
          <SleepCard />
        </div>

        <!-- Active Goals -->
        <div class="md:col-span-1">
          <ActiveGoalsCard />
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import MagicalHeader from '~/components/dashboard/MagicalHeader.vue'
import TodaysRitual from '~/components/dashboard/TodaysRitual.vue'
import StrawberryWaterTracker from '~/components/dashboard/StrawberryWaterTracker.vue'
import PRCard from '~/components/dashboard/PRCard.vue'
import WeeklyStatsCard from '~/components/dashboard/WeeklyStatsCard.vue'
import BodyStatsCard from '~/components/dashboard/BodyStatsCard.vue'
import SleepCard from '~/components/dashboard/SleepCard.vue'
import ActiveGoalsCard from '~/components/dashboard/ActiveGoalsCard.vue'
</script>
