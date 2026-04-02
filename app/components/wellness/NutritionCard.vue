<template>
  <div class="bg-card p-6 md:col-span-2 relative">
    <button @click="showNutritionHistory = true"
      class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style="background: var(--surface-light); color: var(--text-muted)" title="Nutrition History">
      <Icon :name="icons.clock" class="text-sm" />
    </button>
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Icon :name="icons.nutrition" /> Nutrition Log
    </h2>
    <form @submit.prevent="logMeal" class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
      <select v-model="mealForm.mealType" class="px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)">
        <option value="">Meal type</option>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
        <option value="pre_workout">Pre-workout</option>
        <option value="post_workout">Post-workout</option>
      </select>
      <input v-model="mealForm.description" placeholder="What did you eat?" class="px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
      <input v-model.number="mealForm.protein" type="number" placeholder="Protein (g)" class="px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
      <button type="submit" class="py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
        <Icon :name="icons.add" /> Log Meal
      </button>
    </form>
    <!-- Today's meals -->
    <div v-if="todayMeals.length" class="border-t pt-3" style="border-color: var(--border)">
      <h3 class="text-sm font-semibold mb-2" style="color: var(--text-muted)">Today's Meals</h3>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        <div v-for="meal in todayMeals" :key="meal.id" class="flex items-center justify-between p-2.5 rounded-lg" style="background: var(--surface-light)">
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background: color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary)">
              {{ meal.mealType?.replace('_', ' ') || 'Meal' }}
            </span>
            <span class="text-sm">{{ meal.description }}</span>
            <span v-if="meal.protein" class="text-xs" style="color: var(--text-muted)">{{ meal.protein }}g protein</span>
          </div>
          <button @click="deleteMeal(meal.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
            <Icon :name="icons.close" class="text-xs" />
          </button>
        </div>
      </div>
      <div class="mt-2 text-right">
        <span class="text-sm font-medium" style="color: var(--primary)">{{ todayProtein }}g</span>
        <span class="text-xs" style="color: var(--text-muted)"> total protein today</span>
      </div>
    </div>
    <!-- Nutrition History Modal -->
    <Transition name="slide">
      <div v-if="showNutritionHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showNutritionHistory = false">
        <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
              <Icon :name="icons.nutrition" /> Nutrition History
            </h3>
            <button @click="showNutritionHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
          </div>
          <div v-if="nutritionHistoryGrouped.length" class="space-y-2">
            <div v-for="group in nutritionHistoryGrouped" :key="group.date" class="p-3 rounded-xl" style="background: var(--surface-light)">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium">{{ formatDate(group.date) }}</p>
                <span class="text-xs" style="color: var(--primary)">{{ group.totalProtein }}g protein</span>
              </div>
              <div v-for="meal in group.meals" :key="meal.id" class="flex items-center gap-2 p-1.5 rounded-lg mb-1" style="background: var(--surface)">
                <span class="text-xs px-1.5 py-0.5 rounded-full" style="background: color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary)">
                  {{ meal.mealType?.replace('_', ' ') || 'Meal' }}
                </span>
                <span class="text-xs">{{ meal.description }}</span>
                <span v-if="meal.protein" class="text-xs" style="color: var(--text-muted)">{{ meal.protein }}g</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No meals logged yet!</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '~/utils/theme-icons'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

onMounted(async () => {
  try {
    const settings = await $fetch<any>('/api/settings')
    currentTheme.value = settings?.theme || 'yumi'
  } catch {}
  window.addEventListener('theme-change', ((e: CustomEvent) => { currentTheme.value = e.detail.theme }) as EventListener)
})

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
async function logMeal() { if (!mealForm.mealType) return; await $fetch('/api/nutrition', { method: 'POST', body: mealForm }); mealForm.mealType = ''; mealForm.description = ''; mealForm.protein = null; await refreshNutrition() }
async function deleteMeal(id: number) { await $fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' }); await refreshNutrition() }
</script>
