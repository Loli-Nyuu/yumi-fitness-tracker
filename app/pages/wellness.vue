<template>
  <div class="bg-surface min-h-screen pb-20">
    <main class="lg:ml-72 pt-24 px-6 md:px-12 pb-12">
      
      <!-- Header -->
      <WellnessHeader />

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        <!-- Fluid Intake -->
        <div class="md:col-span-2">
          <WellnessFluidIntakeCard />
        </div>

        <!-- Sleep -->
        <div class="md:col-span-1">
          <WellnessSleepCard />
        </div>

        <!-- Soreness -->
        <div class="md:col-span-1">
          <WellnessSorenessCard />
        </div>

        <!-- Breathing -->
        <div class="md:col-span-1">
          <WellnessBreathingCard />
        </div>

        <!-- Nutrition -->
        <div class="md:col-span-2">
          <WellnessNutritionCard />
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import WellnessHeader from '~/components/wellness/WellnessHeader.vue'
import WellnessFluidIntakeCard from '~/components/wellness/FluidIntakeCard.vue'
import WellnessSleepCard from '~/components/wellness/SleepCard.vue'
import WellnessSorenessCard from '~/components/wellness/SorenessCard.vue'
import WellnessBreathingCard from '~/components/wellness/BreathingCard.vue'
import WellnessNutritionCard from '~/components/wellness/NutritionCard.vue'
</script>
