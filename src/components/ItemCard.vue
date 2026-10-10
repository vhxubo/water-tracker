<script setup>
import { inject, ref, watch } from 'vue'
import { relTime, fmtFull, fmtNum } from '../utils/format'

const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['adjust', 'edit', 'remove'])

const confirm = inject('confirm')
const numEl = ref(null)

// 瓶数变化时来一次水波脉冲
watch(
  () => props.item.count,
  () => {
    const el = numEl.value
    if (!el) return
    el.classList.remove('pulse-num')
    void el.offsetWidth
    el.classList.add('pulse-num')
  },
)

async function onRemove() {
  const ok = await confirm({
    title: '删除这条记录？',
    message: `「${props.item.name} ${props.item.ml}ml × ${props.item.count}」将被移出清单，可在历史中回看。`,
    danger: true,
    confirmText: '删除',
  })
  if (ok) emit('remove', props.item.id)
}
</script>

<template>
  <div
    class="card px-4 py-3 transition-opacity"
    :class="item.count === 0 ? 'opacity-55' : ''"
  >
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="truncate font-medium">{{ item.name }}</span>
          <span class="num muted shrink-0 text-xs">{{ fmtNum(item.ml) }} ml</span>
        </div>
        <div class="mt-1 flex items-center gap-2 text-xs">
          <span v-if="item.purpose" class="rounded-full bg-aqua-soft px-2 py-0.5 text-aqua-deep dark:bg-deep2 dark:text-cyan">
            {{ item.purpose }}
          </span>
          <span v-if="item.note" class="muted truncate">{{ item.note }}</span>
        </div>
      </div>

      <!-- 瓶数步进 -->
      <div class="flex items-center gap-1.5">
        <button
          class="btn h-9 w-9 rounded-full border border-line text-lg text-ink-dim dark:border-line-dark dark:text-foam-dim"
          :disabled="item.count === 0"
          :aria-label="'减少一瓶' + item.name"
          @click="emit('adjust', { id: item.id, delta: -1 })"
        >
          −
        </button>
        <span ref="numEl" class="num inline-block w-9 text-center text-xl font-semibold">{{ item.count }}</span>
        <button
          class="btn h-9 w-9 rounded-full border border-aqua text-lg text-aqua dark:border-cyan dark:text-cyan"
          :aria-label="'增加一瓶' + item.name"
          @click="emit('adjust', { id: item.id, delta: 1 })"
        >
          ＋
        </button>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between border-t border-line/70 pt-2 text-xs dark:border-line-dark/70">
      <div class="flex items-center gap-2">
        <span v-if="item.count === 0" class="rounded-full bg-line px-2 py-0.5 dark:bg-line-dark">已用完</span>
        <span class="muted" :title="fmtFull(item.createdAt)">{{ relTime(item.createdAt) }}</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="btn h-7 px-2 text-ink-dim hover:text-aqua dark:text-foam-dim dark:hover:text-cyan" @click="emit('edit', item)">
          编辑
        </button>
        <button
          class="btn h-7 px-2 text-ink-dim hover:text-red-500 dark:text-foam-dim"
          :aria-label="'删除' + item.name"
          @click="onRemove"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>
