<template>
  <div class="bg-surface-container-lowest p-6 md:col-span-2 relative rounded-2xl shadow-[0px_10px_30px_rgba(125,78,88,0.08)] magical-glow transition-all duration-300 hover:scale-[1.01]">
    <button @click="showNutritionHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Nutrition History">
      <Icon name="material-symbols:nest-clock-farsight-analog-outline-rounded" class="text-sm" />
    </button>
    <h2 class="text-2xl font-headline text-primary mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-[#ffb6c1]" style="font-variation-settings: 'FILL' 1">restaurant</span> Meal Tracker
    </h2>
    
    <form @submit.prevent="logMeal" class="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 mb-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="relative sm:col-span-1">
          <select v-model="mealForm.mealType" class="w-full appearance-none px-4 py-3 rounded-xl font-medium text-sm border-2 border-outline-variant/30 focus:border-primary/50 outline-none transition-colors" style="background: var(--surface); color: var(--text)">
            <option value="">Meal Type</option>
            <option value="breakfast">☀️ Breakfast</option>
            <option value="lunch">🥗 Lunch</option>
            <option value="dinner">🌙 Dinner</option>
            <option value="snack">🍎 Snack</option>
            <option value="pre_workout">⚡ Pre-workout</option>
            <option value="post_workout">💪 Post-workout</option>
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none text-sm">expand_more</span>
        </div>
        <input v-model="mealForm.description" placeholder="What did you eat? (e.g., Grilled Chicken Salad)" 
          class="sm:col-span-2 px-4 py-3 rounded-xl font-medium text-sm border-2 border-outline-variant/30 focus:border-primary/50 outline-none transition-colors" 
          style="background: var(--surface); color: var(--text)" />
        <div class="relative sm:col-span-1">
          <input v-model.number="mealForm.protein" type="number" placeholder="Protein" 
            class="w-full px-4 py-3 rounded-xl font-medium text-sm border-2 border-outline-variant/30 focus:border-primary/50 outline-none transition-colors text-center" 
            style="background: var(--surface); color: var(--text)" />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xs font-bold">g</span>
        </div>
      </div>
      <button type="submit" class="w-full py-3 font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:scale-[1.01] shadow-lg shadow-primary/20" 
        style="background: linear-gradient(135deg, #ff6ea9 0%, #b30065 100%); color: white; border-radius: 9999px;">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">add_circle</span> Add to Food Log
      </button>
    </form>
    <!-- Today's meals -->
    <div v-if="todayMeals.length" class="space-y-2">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-sm font-bold text-primary flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">today</span> Today's Meals
        </h3>
        <span class="text-xs font-black px-2 py-1 rounded-full bg-primary/10 text-primary">{{ todayProtein }}g Protein</span>
      </div>
      <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <div v-for="meal in todayMeals" :key="meal.id" class="flex items-center justify-between p-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest hover:scale-[1.01] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">{{ getMealIcon(meal.mealType) }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-primary block">{{ meal.mealType?.replace('_', ' ') || 'Meal' }}</span>
              <span class="text-sm font-medium text-on-surface">{{ meal.description }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div v-if="meal.protein" class="flex items-center gap-1 text-xs font-bold text-primary">
              <span class="material-symbols-outlined text-xs">fitness_center</span> {{ meal.protein }}g
            </div>
            <button @click="deleteMeal(meal.id)" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-danger/10 text-on-surface-variant/50 hover:text-danger">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Nutrition History Modal -->
  <MagicalModal v-model="showNutritionHistory" title="Nutrition Journal" icon="restaurant">
    <div v-if="nutritionHistoryGrouped.length" class="space-y-3">
      <div v-for="group in nutritionHistoryGrouped" :key="group.date" class="p-4 rounded-2xl bg-surface border border-outline-variant/20">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/40">
          <p class="text-sm font-bold text-primary">{{ formatDate(group.date) }}</p>
          <span class="text-xs font-black px-2 py-1 rounded-full" style="background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary)">{{ group.totalProtein }}g protein</span>
        </div>
        <div v-for="meal in group.meals" :key="meal.id" class="flex items-center justify-between p-3 rounded-xl mb-2 bg-surface-container-lowest hover:scale-[1.02] transition-transform">
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold border" style="background: color-mix(in srgb, var(--secondary-container) 30%, transparent); color: var(--on-secondary-container); border-color: color-mix(in srgb, var(--secondary-container) 50%, transparent)">
              {{ meal.mealType?.replace('_', ' ') || 'Meal' }}
            </span>
            <span class="text-sm font-medium">{{ meal.description }}</span>
          </div>
          <div v-if="meal.protein" class="flex items-center gap-1 text-xs font-bold" style="color: var(--primary)">
            <span class="material-symbols-outlined text-sm">fitness_center</span> {{ meal.protein }}g
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-center py-6 text-on-surface-variant/70">No meals logged yet! 🍽️</p>
  </MagicalModal>
</template>

<script setup lang="ts">
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const todayStr = import.meta.client ? new Date().toISOString().split('T')[0] : '2026-04-02'
const showNutritionHistory = ref(false)
const { data: nutritionData, refresh: refreshNutrition } = useFetch<any[]>('/api/nutrition')
const todayMeals = computed(() => { const t = import.meta.client ? new Date().toISOString().split('T')[0] : todayStr; return (nutritionData.value || []).filter((m: any) => m.date === t) })
const todayProtein = computed(() => todayMeals.value.reduce((s: number, m: any) => s + (m.protein || 0), 0))
const nutritionHistoryGrouped = computed(() => {
  const byDate: Record<string, { date: string; meals: any[]; totalProtein: number }> = {}
  for (const m of nutritionData.value || []) { if (!byDate[m.date]) byDate[m.date] = { date: m.date, meals: [], totalProtein: 0 }; byDate[m.date].meals.push(m); byDate[m.date].totalProtein += m.protein || 0 }
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date))
})
const mealForm = reactive({ mealType: '', description: '', protein: null as number | null })
const mealIcons: Record<string, string> = {
  breakfast: 'wb_sunny',
  lunch: 'lunch_dining',
  dinner: 'dinner_dining',
  snack: 'cookie',
  pre_workout: 'bolt',
  post_workout: 'fitness_center'
}

function getMealIcon(type: string) {
  return mealIcons[type as keyof typeof mealIcons] || 'restaurant'
}

async function logMeal() { if (!mealForm.mealType) return; await $fetch('/api/nutrition', { method: 'POST', body: mealForm }); mealForm.mealType = ''; mealForm.description = ''; mealForm.protein = null; await refreshNutrition() }
async function deleteMeal(id: number) { await $fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' }); await refreshNutrition() }
</script>
