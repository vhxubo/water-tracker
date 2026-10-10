<script setup>
import { inject } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  danger: { type: Boolean, default: false },
  confirmText: { type: String, default: '确认' },
})
const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[60] bg-black/40" @click="emit('close')" />
    </Transition>
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl dark:bg-deep"
        role="alertdialog"
        aria-modal="true"
      >
        <h3 class="text-base font-semibold">{{ title }}</h3>
        <p class="mt-2 text-sm leading-relaxed muted">{{ message }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button class="btn h-10 rounded-xl border border-line px-4 text-sm dark:border-line-dark" @click="emit('close')">
            取消
          </button>
          <button
            class="btn h-10 rounded-xl px-4 text-sm font-medium text-white"
            :class="danger ? 'bg-red-500' : 'bg-aqua dark:bg-cyan dark:text-abyss'"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
