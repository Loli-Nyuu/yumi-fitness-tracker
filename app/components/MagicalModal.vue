<template>
  <Transition :name="transitionName" @after-enter="onEnter" @after-leave="onLeave">
    <div v-if="modelValue" 
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#fff4f7]/60 backdrop-blur-md"
      @click.self="handleOutsideClick"
      role="dialog"
      aria-modal="true">
      
      <div class="w-full max-w-7xl max-h-[80vh] overflow-y-auto rounded-3xl p-6 bg-surface-container-lowest border-2 border-tertiary-container/30 shadow-2xl relative"
        :class="contentClass">
        
        <!-- Header -->
        <div v-if="$slots.header || showClose" class="flex items-center justify-between mb-6">
          <slot name="header">
            <h3 class="font-headline text-xl font-bold text-primary flex items-center gap-2">
              <span v-if="icon" class="material-symbols-outlined" :style="{ color: iconColor }">{{ icon }}</span>
              <span v-if="title" :style="{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }">{{ title }}</span>
            </h3>
          </slot>
          
          <button v-if="showClose" 
            @click="$emit('update:modelValue', false)" 
            class="transition-transform text-on-surface-variant p-1 group"
            aria-label="Close modal">
            <Icon :name="closeIcon || 'material-symbols:close-rounded'" class="text-3xl group-hover:scale-125 transition transform" style="color: #ff6ea9" />
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-outline-variant/20">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  icon?: string
  iconColor?: string
  gradient?: string
  closeIcon?: string
  showClose?: boolean
  transitionName?: string
  contentClass?: string
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  preventClose?: boolean
}>(), {
  modelValue: false,
  title: '',
  icon: '',
  iconColor: '#ffb6c1',
  gradient: 'linear-gradient(135deg, #b30065 0%, #ff6ea9 100%)',
  closeIcon: '',
  showClose: true,
  transitionName: 'modal-pop',
  contentClass: '',
  closeOnEsc: true,
  closeOnOutsideClick: true,
  preventClose: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

function handleClose() {
  if (!props.preventClose) {
    emit('update:modelValue', false)
  }
}

function handleOutsideClick() {
  if (props.closeOnOutsideClick) {
    handleClose()
  }
}

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEsc) {
    handleClose()
  }
}

function onEnter() {
  emit('open')
}

function onLeave() {
  emit('close')
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEsc)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEsc)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleEsc)
})
</script>

<style scoped>
.modal-content {
  min-height: 50px;
}

/* Pop Animation */
.modal-pop-enter-active, .modal-pop-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: scale(0.9) translateY(10px); }

/* Slide Up Animation */
.modal-slide-up-enter-active, .modal-slide-up-leave-active { transition: all 0.3s ease-out; }
.modal-slide-up-enter-from, .modal-slide-up-leave-to { opacity: 0; transform: translateY(20px); }

/* Fade Animation */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
