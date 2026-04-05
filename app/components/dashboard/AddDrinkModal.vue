<template>
  <Transition name="slide">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-tertiary-container/20">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-headline text-xl font-bold text-primary">Add a Drink</h3>
          <button @click="closeModal" class="text-on-surface-variant hover:text-primary transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Drink Type Selection -->
        <div class="mb-6">
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Type</label>
          <div class="grid grid-cols-5 gap-2">
            <button v-for="type in drinkTypes" :key="type.id" 
              @click="selectedType = type.id"
              class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              :class="selectedType === type.id ? 'bg-tertiary-container/30 ring-2 ring-primary' : 'bg-surface-container-low'">
              <img :src="type.icon" class="w-8 h-8 object-contain" />
              <span class="text-[10px] font-bold text-on-surface-variant capitalize">{{ type.id }}</span>
            </button>
          </div>
        </div>

        <!-- Subtype Selection (Conditional) -->
        <div v-if="subtypes[selectedType].length > 0" class="mb-6">
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Subtype</label>
          <select v-model="selectedSubtype" class="w-full bg-surface-container-low p-3 rounded-xl text-on-surface border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            <option value="">Select a flavor...</option>
            <option v-for="sub in subtypes[selectedType]" :key="sub" :value="sub">{{ sub }}</option>
          </select>
        </div>

        <!-- Size Selection -->
        <div class="mb-8">
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Size</label>
          <div class="flex gap-3">
            <button v-for="size in sizes" :key="size.id"
              @click="selectedSize = size"
              class="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              :class="selectedSize.id === size.id ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-low text-on-surface-variant'">
              {{ size.label }}
            </button>
          </div>
        </div>

        <button @click="confirmAdd" class="w-full ribbon-gradient text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add</span>
          Add Drink
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'add'])

const selectedType = ref('water')
const selectedSubtype = ref('')
const selectedSize = ref({ id: 'medium', ml: 220, label: 'Medium' })

// Subtype mappings
const subtypes: Record<string, string[]> = {
  water: [],
  coffee: ['Espresso', 'Black Coffee', 'Cappuccino', 'Latte'],
  tea: ['Green Tea', 'Black Tea', 'Chamomile', 'Earl Grey'],
  juice: ['Orange', 'Green', 'Apple', 'Pineapple', 'Passion Fruit'],
  soda: ['Coke', 'Sprite', 'Fanta', 'Pepsi', 'Root Beer']
}

const drinkTypes = [
  { id: 'water', icon: '/images/drinks/water-glass.png' },
  { id: 'coffee', icon: '/images/drinks/coffee-cup.png' },
  { id: 'tea', icon: '/images/drinks/tea-cup.png' },
  { id: 'juice', icon: '/images/drinks/juice-glass.png' },
  { id: 'soda', icon: '/images/drinks/soda-glass.png' },
]

const sizes = [
  { id: 'small', ml: 150, label: 'Small' },
  { id: 'medium', ml: 220, label: 'Medium' },
  { id: 'large', ml: 350, label: 'Large' },
]

function closeModal() {
  emit('close')
}

function confirmAdd() {
  emit('add', { 
    type: selectedType.value, 
    subtype: selectedSubtype.value || null,
    amountMl: selectedSize.value.ml 
  })
  closeModal()
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; }
.slide-enter-from > div, .slide-leave-to > div { transform: translateY(20px) scale(0.95); }
</style>
