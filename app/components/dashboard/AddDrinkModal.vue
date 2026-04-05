<template>
  <Transition name="modal-pop">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="w-full max-w-sm bg-surface-container-lowest rounded-[2.5rem] p-6 shadow-2xl border-2 border-tertiary-container/20">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-headline text-2xl font-black text-primary magical-text">Add a Drink</h3>
          <button @click="closeModal" class="text-on-surface-variant hover:text-primary hover:rotate-90 transition-all duration-300">
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <!-- Drink Type Selection -->
        <div class="mb-6">
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block opacity-50">Choose your potion</label>
          <div class="grid grid-cols-5 gap-3">
            <div v-for="type in drinkTypes" :key="type.id" class="relative group">
              <button 
                @click="selectedType = type.id"
                class="w-full aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center"
                :class="selectedType === type.id ? 'bg-tertiary-container shadow-[0_0_15px_rgba(255,182,193,0.6)] scale-110' : 'bg-surface-container-low hover:bg-surface-container hover:scale-105'">
                <img :src="type.icon" class="w-10 h-10 object-contain drop-shadow-md" :class="selectedType === type.id ? 'animate-bounce' : ''" />
              </button>
              <!-- Tooltip for Type -->
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-[#1f1c1d] text-white text-[10px] rounded-lg whitespace-nowrap z-20">
                {{ type.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Subtype Selection (Conditional) -->
        <Transition name="slide-down">
          <div v-if="subtypes[selectedType].length > 0" class="mb-6">
            <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block opacity-50">Pick a flavor</label>
            <div class="relative">
              <select v-model="selectedSubtype" class="w-full bg-surface-container-low p-4 rounded-2xl text-on-surface border-2 border-transparent focus:border-primary focus:ring-0 outline-none font-bold appearance-none cursor-pointer hover:bg-surface-container transition-colors">
                <option v-for="sub in subtypes[selectedType]" :key="sub" :value="sub">{{ sub }}</option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
            </div>
          </div>
        </Transition>

        <!-- Size Selection -->
        <div class="mb-8">
          <label class="text-xs font-bold text-on-surface-variant uppercase mb-2 block opacity-50">How thirsty are you?</label>
          <div class="flex gap-3">
            <button v-for="size in sizes" :key="size.id"
              @click="selectedSize = size"
              class="flex-1 py-4 rounded-2xl font-black text-sm transition-all duration-300"
              :class="selectedSize.id === size.id ? 'bg-primary text-white shadow-xl scale-105' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'">
              {{ size.label }}
            </button>
          </div>
        </div>

        <button @click="confirmAdd" class="w-full ribbon-gradient text-white py-5 rounded-full font-black shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 group">
          <span class="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500" style="font-variation-settings: 'FILL' 1;">add</span>
          Add Drink
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'add'])

// Defaults as requested
const selectedType = ref('water')
const selectedSubtype = ref('')
const selectedSize = ref({ id: 'medium', ml: 220, label: 'Medium' })

const drinkTypes = [
  { id: 'water', icon: '/images/drinks/water-glass.png', label: 'Water' },
  { id: 'coffee', icon: '/images/drinks/coffee-cup.png', label: 'Coffee' },
  { id: 'tea', icon: '/images/drinks/tea-cup.png', label: 'Tea' },
  { id: 'juice', icon: '/images/drinks/juice-glass.png', label: 'Juice' },
  { id: 'soda', icon: '/images/drinks/soda-glass.png', label: 'Soda' },
]

const subtypes: Record<string, string[]> = {
  water: [],
  coffee: ['Black Coffee', 'Espresso', 'Cappuccino', 'Latte'],
  tea: ['Spearmint', 'Green Tea', 'Black Tea', 'Chamomile', 'Earl Grey'],
  juice: ['Green Juice', 'Orange', 'Apple', 'Pineapple', 'Passion Fruit'],
  soda: ['Coke Zero', 'Coke', 'Sprite', 'Fanta', 'Root Beer']
}

const sizes = [
  { id: 'small', ml: 150, label: 'Small' },
  { id: 'medium', ml: 220, label: 'Medium' },
  { id: 'large', ml: 350, label: 'Large' },
]

// Watch for type changes to update defaults
watch(selectedType, (newType) => {
  if (subtypes[newType].length > 0) {
    selectedSubtype.value = subtypes[newType][0] // Set first as default
  } else {
    selectedSubtype.value = ''
  }
})

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
.modal-pop-enter-active, .modal-pop-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: scale(0.8) translateY(20px); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

.magical-text {
  background: linear-gradient(135deg, #b30065 0%, #ff6ea9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
