<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gradient" style="font-family: var(--font-heading)">🧘 Wellness</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- ═══════════════════════════════════════ -->
      <!-- 💧 FLUID TRACKER                        -->
      <!-- ═══════════════════════════════════════ -->
      <div class="bg-card p-6 md:col-span-2 relative">
        <button @click="showFluidHistory = true"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style="background: var(--surface-light); color: var(--text-muted)" title="Fluid History">
          <Icon :name="icons.clock" class="text-sm" />
        </button>
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon :name="icons.water" /> Fluid Intake
        </h2>
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-3xl font-bold" style="color: var(--primary)">{{ summary.effectiveMl }}</span>
              <span class="text-lg" style="color: var(--text-muted)"> / {{ summary.targetMl }} ml</span>
            </div>
            <div class="text-right">
              <p class="text-sm" style="color: var(--text-muted)">Total: {{ summary.totalMl }} ml</p>
              <p class="text-xs" style="color: var(--text-muted)">Effective hydration</p>
            </div>
          </div>
          <div class="h-3 rounded-full overflow-hidden" style="background: var(--surface-light)">
            <div class="h-full rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(summary.percentComplete, 100)}%`, background: 'var(--gradient)' }" />
          </div>
          <p class="text-xs mt-1" style="color: var(--text-muted)">{{ summary.percentComplete }}% of daily target</p>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          <div v-for="(data, type) in summary.byType" :key="type"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
            :style="{ background: 'var(--surface-light)', color: 'var(--text)' }">
            <Icon :name="fluidIcon(type)" class="text-base" />
            <span class="font-medium">{{ data.totalMl }} ml</span>
            <span style="color: var(--text-muted)">({{ Math.round(data.totalMl * hydrationFactor(type)) }} eff.)</span>
          </div>
          <div v-if="Object.keys(summary.byType).length === 0" class="text-sm" style="color: var(--text-muted)">
            No drinks logged today. Stay hydrated!
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          <button v-for="type in fluidTypes" :key="type.id" @click="selectedFluid = type.id"
            class="p-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
            :style="selectedFluid === type.id
              ? { background: 'var(--primary)', color: 'var(--background)' }
              : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
            <Icon :name="type.icon" class="text-xl" />
            <span class="text-xs font-medium">{{ type.label }}</span>
          </button>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          <button v-for="size in currentSizes" :key="size.ml" @click="addFluid(size.ml)"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
            :style="{ background: 'var(--surface-light)', color: 'var(--text)', borderRadius: 'var(--radius-sm)' }">
            <Icon :name="icons.add" class="text-sm" />
            {{ size.label }}
            <span style="color: var(--text-muted)">({{ size.ml }}ml = {{ Math.round(size.ml * hydrationFactor(selectedFluid)) }} eff.)</span>
          </button>
        </div>
        <form @submit.prevent="addFluid(customAmount)" class="flex gap-2">
          <input v-model.number="customAmount" type="number" placeholder="Custom ml"
            class="flex-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
          <button type="submit" class="px-4 py-2 rounded-xl font-medium"
            :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
            <Icon :name="icons.add" /> Add
          </button>
        </form>
        <div v-if="groupedEntries.length" class="mt-4">
          <h3 class="text-sm font-semibold mb-2" style="color: var(--text-muted)">Today's Log</h3>
          <div class="space-y-1 max-h-48 overflow-y-auto">
            <div v-for="group in groupedEntries" :key="group.key"
              class="flex items-center justify-between p-2.5 rounded-lg" style="background: var(--surface-light)">
              <div class="flex items-center gap-2.5">
                <Icon :name="fluidIcon(group.type)" class="text-lg" />
                <div>
                  <span class="capitalize font-medium">{{ group.type }}</span>
                  <span style="color: var(--text-muted)"> · {{ group.ml }}ml</span>
                  <span v-if="group.count > 1" style="color: var(--text-muted)"> ×{{ group.count }}</span>
                  <span class="text-xs ml-1" style="color: var(--primary)">
                    = {{ Math.round(group.ml * group.count * hydrationFactor(group.type)) }} eff.
                  </span>
                </div>
              </div>
              <button @click="removeFluid(group)" class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
                <Icon :name="icons.close" class="text-xs" />
              </button>
            </div>
          </div>
        </div>
        <!-- Fluid History Modal -->
        <Transition name="slide">
          <div v-if="showFluidHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showFluidHistory = false">
            <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
                  <Icon :name="icons.water" /> Fluid History
                </h3>
                <button @click="showFluidHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
              </div>
              <div v-if="fluidHistory.length" class="space-y-2">
                <div v-for="day in fluidHistory" :key="day.date" class="p-3 rounded-xl" style="background: var(--surface-light)">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">{{ formatDate(day.date) }}</p>
                    <div class="text-right">
                      <span class="text-sm font-bold" style="color: var(--primary)">{{ day.effectiveMl }} eff.</span>
                      <span class="text-xs ml-1" style="color: var(--text-muted)">/ {{ day.totalMl }} ml</span>
                    </div>
                  </div>
                  <div class="mt-2 h-2 rounded-full overflow-hidden" style="background: var(--border)">
                    <div class="h-full rounded-full" :style="{ width: Math.min(Math.round(day.effectiveMl / 2500 * 100), 100) + '%', background: 'var(--gradient)' }" />
                  </div>
                  <p class="text-xs mt-1" style="color: var(--text-muted)">{{ day.count }} drinks · {{ Math.round(day.effectiveMl / 2500 * 100) }}% of target</p>
                </div>
              </div>
              <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No history yet!</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ═══════════════════════════════════════ -->
      <!-- 😴 SLEEP                                -->
      <!-- ═══════════════════════════════════════ -->
      <div class="bg-card p-6 relative">
        <button @click="showSleepHistory = true"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style="background: var(--surface-light); color: var(--text-muted)" title="Sleep History">
          <Icon :name="icons.clock" class="text-sm" />
        </button>
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon :name="icons.sleep" /> Sleep
        </h2>
        <form @submit.prevent="logSleep" class="space-y-3 mb-4">
          <div class="flex gap-2">
            <button type="button" @click="sleepForm.sleepType = 'sleep'"
              class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              :style="sleepForm.sleepType === 'sleep'
                ? { background: 'var(--primary)', color: 'var(--background)' }
                : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              <Icon :name="icons.sleep" /> Sleep
            </button>
            <button type="button" @click="sleepForm.sleepType = 'nap'"
              class="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              :style="sleepForm.sleepType === 'nap'
                ? { background: 'var(--primary)', color: 'var(--background)' }
                : { background: 'var(--surface-light)', color: 'var(--text-muted)' }">
              <Icon :name="icons.clock" /> Nap
            </button>
          </div>
          <div>
            <label class="text-sm" style="color: var(--text-muted)">Quality (1-5)</label>
            <div class="flex gap-2 mt-1">
              <button v-for="i in 5" :key="i" type="button" @click="sleepForm.quality = i" class="text-2xl transition-all"
                :style="{ opacity: i <= sleepForm.quality ? '1' : '0.3', transform: i <= sleepForm.quality ? 'scale(1.1)' : 'scale(1)' }">
                <Icon :name="icons.star" :style="{ color: 'var(--accent)' }" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-sm" style="color: var(--text-muted)">Hours</label>
              <input v-model.number="sleepForm.hours" type="number" step="0.5" placeholder="7" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
            </div>
            <div>
              <label class="text-sm" style="color: var(--text-muted)">Date</label>
              <input v-model="sleepForm.date" type="date" class="w-full mt-1 px-3 py-2 rounded-xl" style="background: var(--surface); border: 1px solid var(--border); color: var(--text)" />
            </div>
          </div>
          <button type="submit" class="w-full py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2" :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
            <Icon :name="icons.complete" /> Log Sleep
          </button>
        </form>
        <!-- Sleep History Modal -->
        <Transition name="slide">
          <div v-if="showSleepHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showSleepHistory = false">
            <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
                  <Icon :name="icons.sleep" /> Sleep History
                </h3>
                <button @click="showSleepHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
              </div>
              <div v-if="sleepHistory.length" class="space-y-2">
                <div v-for="group in sleepHistoryGrouped" :key="group.date" class="p-3 rounded-xl" style="background: var(--surface-light)">
                  <p class="text-sm font-medium mb-2">{{ formatDate(group.date) }}</p>
                  <div v-for="entry in group.entries" :key="entry.id" class="flex items-center justify-between p-2 rounded-lg mb-1" style="background: var(--surface)">
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-1.5 py-0.5 rounded-full" :style="(entry.sleepType || 'sleep') === 'nap'
                        ? { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }
                        : { background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' }">
                        {{ (entry.sleepType || 'sleep') === 'nap' ? 'Nap' : 'Sleep' }}
                      </span>
                      <span class="text-sm">{{ entry.hours }}h</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex gap-0.5">
                        <Icon v-for="i in 5" :key="i" :name="icons.star" class="text-sm"
                          :style="{ opacity: i <= entry.quality ? '1' : '0.2', color: 'var(--accent)' }" />
                      </div>
                      <button @click="deleteSleep(entry.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
                        <Icon :name="icons.close" class="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No sleep logged yet!</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ═══════════════════════════════════════ -->
      <!-- 🤕 SORENESS                             -->
      <!-- ═══════════════════════════════════════ -->
      <div class="bg-card p-6 relative">
        <button @click="showSorenessHistory = true"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style="background: var(--surface-light); color: var(--text-muted)" title="Soreness History">
          <Icon :name="icons.clock" class="text-sm" />
        </button>
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon :name="icons.soreness" /> Soreness
        </h2>
        <p class="text-xs mb-3" style="color: var(--text-muted)">Set each area, then submit.</p>
        <div class="space-y-2">
          <div v-for="part in bodyParts" :key="part.value" class="flex items-center justify-between p-2.5 rounded-lg" style="background: var(--surface-light)">
            <span class="text-sm font-medium">{{ part.label }}</span>
            <div class="flex gap-1">
              <button v-for="i in [0,1,2,3,4,5]" :key="i" @click="sorenessDraft[part.value] = i"
                class="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                :style="draftButtonStyle(part.value, i)">{{ i }}</button>
            </div>
          </div>
        </div>
        <button @click="submitSoreness" :disabled="!sorenessDirty"
          class="w-full mt-4 py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30"
          :style="{ background: 'var(--primary)', color: 'var(--background)', borderRadius: 'var(--radius)' }">
          <Icon :name="icons.complete" /> {{ sorenessSubmitting ? 'Saving...' : 'Set Soreness' }}
        </button>
        <!-- Soreness History Modal -->
        <Transition name="slide">
          <div v-if="showSorenessHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showSorenessHistory = false">
            <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
                  <Icon :name="icons.soreness" /> Soreness History
                </h3>
                <button @click="showSorenessHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
              </div>
              <div v-if="Object.keys(sorenessHistoryGrouped).length" class="space-y-2">
                <div v-for="(group, date) in sorenessHistoryGrouped" :key="date" class="p-3 rounded-xl" style="background: var(--surface-light)">
                  <p class="text-sm font-medium mb-2">{{ formatDate(date as string) }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="(sev, part) in group" :key="part" class="text-xs px-2 py-0.5 rounded-full font-medium"
                      :style="{ background: sorenessColorBg(sev as number), color: sorenessColorFg(sev as number) }">
                      {{ bodyPartEmoji(part as string) }} {{ part }}: {{ sev }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No history yet!</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ═══════════════════════════════════════ -->
      <!-- 🫁 BREATHING                            -->
      <!-- ═══════════════════════════════════════ -->
      <div class="bg-card p-6 relative">
        <button @click="showBreathingHistory = true"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style="background: var(--surface-light); color: var(--text-muted)" title="Breathing History">
          <Icon :name="icons.clock" class="text-sm" />
        </button>
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon :name="icons.breathing" /> Breathing
        </h2>
        <div class="grid grid-cols-1 gap-2">
          <button v-for="pattern in breathingPatterns" :key="pattern.id" @click="startBreathing(pattern)"
            class="p-3 rounded-xl text-left transition-all" :style="{ background: 'var(--surface-light)', borderRadius: 'var(--radius)' }">
            <p class="font-semibold">{{ pattern.name }}</p>
            <p class="text-sm" style="color: var(--text-muted)">{{ pattern.description }}</p>
          </button>
        </div>
        <div v-if="activeBreathing" class="mt-4 text-center">
          <Icon :name="icons.breathing" class="text-6xl mb-4 transition-all duration-1000" :class="breathPhase === 'inhale' ? 'scale-125' : breathPhase === 'exhale' ? 'scale-75' : 'scale-100'" />
          <p class="text-2xl font-bold capitalize" style="color: var(--primary)">{{ breathPhase }}</p>
          <p class="text-4xl font-mono mt-2">{{ breathTimer }}</p>
          <p class="text-sm mt-1" style="color: var(--text-muted)">Round {{ breathRounds }} · {{ formatDuration(breathElapsed) }}</p>
          <button @click="stopBreathing" class="mt-4 px-4 py-2 rounded-xl transition-all flex items-center gap-2 mx-auto" :style="{ background: 'color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)', borderRadius: 'var(--radius)' }">
            <Icon :name="icons.stop" /> Stop
          </button>
        </div>
        <!-- Breathing History Modal -->
        <Transition name="slide">
          <div v-if="showBreathingHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showBreathingHistory = false">
            <div class="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2" style="color: var(--primary)">
                  <Icon :name="icons.breathing" /> Breathing History
                </h3>
                <button @click="showBreathingHistory = false" style="color: var(--text-muted)"><Icon :name="icons.close" /></button>
              </div>
              <div v-if="breathingHistory.length" class="space-y-2">
                <div v-for="entry in breathingHistory" :key="entry.id" class="flex items-center justify-between p-3 rounded-xl" style="background: var(--surface-light)">
                  <div>
                    <p class="text-sm font-medium">{{ entry.pattern }}</p>
                    <p class="text-xs" style="color: var(--text-muted)">{{ formatDate(entry.date) }} · {{ formatDuration(entry.duration) }} · {{ entry.rounds }} rounds</p>
                  </div>
                  <button @click="deleteBreathing(entry.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style="background: color-mix(in srgb, var(--danger) 20%, transparent); color: var(--danger)">
                    <Icon :name="icons.close" class="text-xs" />
                  </button>
                </div>
              </div>
              <p v-else class="text-sm text-center py-4" style="color: var(--text-muted)">No sessions yet!</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ═══════════════════════════════════════ -->
      <!-- 🍽️ NUTRITION                            -->
      <!-- ═══════════════════════════════════════ -->
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { getIcons } from '../utils/theme-icons'

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

function formatDuration(seconds: number) {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

// FLUID TRACKER
const { data: fluidData, refresh: refreshFluids } = useFetch<any>('/api/fluids')
const summary = computed(() => fluidData.value?.summary || { byType: {}, totalMl: 0, effectiveMl: 0, targetMl: 2500, percentComplete: 0 })
const entries = computed(() => fluidData.value?.entries || [])
const showFluidHistory = ref(false)
const { data: fluidHistoryData, refresh: refreshFluidHistory } = useFetch<any[]>('/api/fluids?date=all')
const fluidHistory = computed(() => fluidHistoryData.value || [])

interface FluidGroup { key: string; type: string; ml: number; count: number; ids: number[] }

const groupedEntries = computed<FluidGroup[]>(() => {
  const map = new Map<string, FluidGroup>()
  for (const entry of entries.value) {
    const key = `${entry.type}-${entry.amountMl}`
    if (!map.has(key)) map.set(key, { key, type: entry.type, ml: entry.amountMl, count: 0, ids: [] })
    const g = map.get(key)!; g.count++; g.ids.push(entry.id)
  }
  return Array.from(map.values())
})

async function removeFluid(group: FluidGroup) {
  await $fetch(`/api/fluids?id=${group.ids[group.ids.length - 1]}`, { method: 'DELETE' })
  await refreshFluids()
}

const selectedFluid = ref('water')
const customAmount = ref(250)
const fluidTypes = [
  { id: 'water', label: 'Water', icon: 'mdi:water' },
  { id: 'coffee', label: 'Coffee', icon: 'mdi:coffee' },
  { id: 'tea', label: 'Tea', icon: 'mdi:tea' },
  { id: 'juice', label: 'Juice', icon: 'mdi:fruit-citrus' },
  { id: 'soda', label: 'Soda', icon: 'mdi:bottle-soda' },
  { id: 'other', label: 'Other', icon: 'mdi:cup' },
]
const hydrationFactors: Record<string, number> = { water: 1.0, tea: 0.9, juice: 1.0, soda: 0.9, coffee: 0.8, other: 0.85 }
const defaultSizes: Record<string, { label: string; ml: number }[]> = {
  water: [{ label: 'Small glass', ml: 200 }, { label: 'Regular glass', ml: 250 }, { label: 'Big glass', ml: 350 }, { label: 'Bottle', ml: 500 }],
  coffee: [{ label: 'Espresso', ml: 30 }, { label: 'Small cup', ml: 150 }, { label: 'Regular cup', ml: 200 }, { label: 'Large mug', ml: 350 }],
  tea: [{ label: 'Small cup', ml: 150 }, { label: 'Regular cup', ml: 200 }, { label: 'Large mug', ml: 300 }],
  juice: [{ label: 'Small glass', ml: 150 }, { label: 'Regular glass', ml: 250 }, { label: 'Large glass', ml: 350 }],
  soda: [{ label: 'Can', ml: 350 }, { label: 'Small bottle', ml: 500 }, { label: 'Large bottle', ml: 600 }],
  other: [{ label: 'Small', ml: 150 }, { label: 'Medium', ml: 250 }, { label: 'Large', ml: 350 }],
}
const currentSizes = computed(() => defaultSizes[selectedFluid.value] || defaultSizes.other)
function fluidIcon(type: string) { return fluidTypes.find(f => f.id === type)?.icon || 'mdi:cup' }
function hydrationFactor(type: string) { return hydrationFactors[type] || 0.85 }
async function addFluid(ml: number) {
  if (!ml || ml <= 0) return
  await $fetch('/api/fluids', { method: 'POST', body: { type: selectedFluid.value, amountMl: ml } })
  await refreshFluids(); await refreshFluidHistory()
}

// SLEEP
const { data: sleepData, refresh: refreshSleep } = useFetch<any>('/api/sleep')
const sleepHistory = computed(() => { const d = sleepData.value; return !d ? [] : Array.isArray(d) ? d : d.entries || [] })
const sleepHistoryGrouped = computed(() => {
  const byDate: Record<string, { date: string; entries: any[] }> = {}
  for (const e of sleepHistory.value) { if (!byDate[e.date]) byDate[e.date] = { date: e.date, entries: [] }; byDate[e.date].entries.push(e) }
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date))
})
const showSleepHistory = ref(false)
const todayStr = import.meta.client ? new Date().toISOString().split('T')[0] : '2026-04-02'
const sleepForm = reactive({ sleepType: 'sleep', quality: 3, hours: null as number | null, date: todayStr })
async function logSleep() {
  await $fetch('/api/sleep', { method: 'POST', body: sleepForm })
  sleepForm.sleepType = 'sleep'; sleepForm.quality = 3; sleepForm.hours = null; sleepForm.date = new Date().toISOString().split('T')[0]
  await refreshSleep()
}
async function deleteSleep(id: number) { await $fetch(`/api/sleep?id=${id}`, { method: 'DELETE' }); await refreshSleep() }

// SORENESS (BATCH)
const bodyParts = [
  { value: 'glutes', label: '🍑 Glutes' }, { value: 'quads', label: '🦵 Quads' },
  { value: 'hamstrings', label: '🦿 Hamstrings' }, { value: 'core', label: '💪 Core' },
  { value: 'back', label: '🔙 Back' }, { value: 'ankles', label: '🦶 Ankles' },
]
const sorenessDraft = ref<Record<string, number>>({ glutes: 0, quads: 0, hamstrings: 0, core: 0, back: 0, ankles: 0 })
const sorenessDirty = ref(false)
const sorenessSubmitting = ref(false)
const showSorenessHistory = ref(false)

const sorenessLoaded = ref(false)

if (import.meta.client) {
  onMounted(async () => {
    try {
      const data = await $fetch<Record<string, { id: number; severity: number }>>('/api/soreness')
      for (const p of bodyParts) sorenessDraft.value[p.value] = data?.[p.value]?.severity || 0
    } catch {}
    sorenessLoaded.value = true
  })
}
watch(sorenessDraft, () => { sorenessDirty.value = true }, { deep: true })

function draftButtonStyle(partValue: string, severity: number) {
  const current = sorenessDraft.value[partValue] || 0; const isSelected = current === severity
  const colors = ['var(--text-muted)', 'var(--success)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--danger)']
  const bgs = ['transparent', 'color-mix(in srgb, var(--success) 20%, transparent)', 'color-mix(in srgb, var(--success) 30%, transparent)', 'color-mix(in srgb, var(--warning) 20%, transparent)', 'color-mix(in srgb, var(--danger) 20%, transparent)', 'color-mix(in srgb, var(--danger) 30%, transparent)']
  return { background: isSelected && severity > 0 ? colors[severity] : bgs[severity], color: isSelected ? (severity === 0 ? 'var(--text)' : 'var(--background)') : colors[severity], borderRadius: 'var(--radius-sm)', boxShadow: isSelected && severity > 0 ? '0 0 8px ' + colors[severity] : 'none', border: severity === 0 ? '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)') : 'none' }
}

async function submitSoreness() {
  sorenessSubmitting.value = true
  const entriesArr = bodyParts.map(p => ({ bodyPart: p.value, severity: sorenessDraft.value[p.value] || 0 }))
  const result = await $fetch('/api/soreness', { method: 'POST', body: { entries: entriesArr } })
  for (const p of bodyParts) sorenessDraft.value[p.value] = (result as any)?.[p.value]?.severity || 0
  sorenessDirty.value = false; sorenessSubmitting.value = false; await refreshSorenessHistory()
}

const { data: sorenessHistoryData, refresh: refreshSorenessHistory } = useFetch<any[]>('/api/soreness?date=all')
const sorenessHistory = computed(() => sorenessHistoryData.value || [])
const sorenessHistoryGrouped = computed(() => {
  const byDate: Record<string, Record<string, number>> = {}
  for (const e of sorenessHistory.value) { if (!byDate[e.date]) byDate[e.date] = {}; byDate[e.date][e.bodyPart] = e.severity }
  return Object.fromEntries(Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])))
})
const bodyPartEmojis: Record<string, string> = { glutes: '🍑', quads: '🦵', hamstrings: '🦿', core: '💪', back: '🔙', ankles: '🦶' }
function bodyPartEmoji(part: string) { return bodyPartEmojis[part] || '📍' }
function sorenessColorBg(sev: number) { return sev <= 2 ? 'color-mix(in srgb, var(--success) 20%, transparent)' : sev <= 3 ? 'color-mix(in srgb, var(--warning) 20%, transparent)' : 'color-mix(in srgb, var(--danger) 20%, transparent)' }
function sorenessColorFg(sev: number) { return sev <= 2 ? 'var(--success)' : sev <= 3 ? 'var(--warning)' : 'var(--danger)' }

// BREATHING
const breathingPatterns = [
  { id: 'box', name: 'Box Breathing', description: '4-4-4-4. Calming.', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: '478', name: '4-7-8 Breathing', description: 'Sleep aid.', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'diaphragmatic', name: 'Deep Belly', description: 'Slow deep breaths. 5-5.', inhale: 5, hold1: 2, exhale: 5, hold2: 0 },
]
const activeBreathing = ref<any>(null)
const breathPhase = ref('inhale')
const breathTimer = ref(0)
const breathRounds = ref(1)
const breathElapsed = ref(0)
const showBreathingHistory = ref(false)
let breathInterval: ReturnType<typeof setInterval> | null = null
let breathElapsedInterval: ReturnType<typeof setInterval> | null = null
const { data: breathingHistoryData, refresh: refreshBreathing } = useFetch<any[]>('/api/breathing')
const breathingHistory = computed(() => breathingHistoryData.value || [])

function startBreathing(pattern: any) {
  activeBreathing.value = pattern; breathPhase.value = 'inhale'; breathTimer.value = pattern.inhale
  breathRounds.value = 1; breathElapsed.value = 0
  if (breathInterval) clearInterval(breathInterval); if (breathElapsedInterval) clearInterval(breathElapsedInterval)
  breathElapsedInterval = setInterval(() => { breathElapsed.value++ }, 1000)
  const phases = ['inhale', 'hold1', 'exhale', 'hold2']
  const durations = [pattern.inhale, pattern.hold1, pattern.exhale, pattern.hold2]
  let phaseIndex = 0
  breathInterval = setInterval(() => {
    breathTimer.value--
    if (breathTimer.value <= 0) {
      phaseIndex = (phaseIndex + 1) % 4
      if (durations[phaseIndex] === 0) phaseIndex = (phaseIndex + 1) % 4
      if (phaseIndex === 0) breathRounds.value++
      breathPhase.value = phases[phaseIndex]; breathTimer.value = durations[phaseIndex]
    }
  }, 1000)
}

async function stopBreathing() {
  if (breathInterval) clearInterval(breathInterval); if (breathElapsedInterval) clearInterval(breathElapsedInterval)
  const pattern = activeBreathing.value
  if (pattern && breathElapsed.value > 0) {
    await $fetch('/api/breathing', { method: 'POST', body: { pattern: pattern.name, duration: breathElapsed.value, rounds: breathRounds.value } })
    await refreshBreathing()
  }
  activeBreathing.value = null
}
async function deleteBreathing(id: number) { await $fetch(`/api/breathing?id=${id}`, { method: 'DELETE' }); await refreshBreathing() }

// NUTRITION
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
