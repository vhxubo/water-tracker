<script setup>
import { computed, inject } from 'vue'
import { useStore } from '../composables/useStore'
import { fmtHM, dayLabel, fmtNum } from '../utils/format'

const { state, clearHistory } = useStore()
const confirm = inject('confirm')

const ACTION_META = {
  add: { label: '放入', cls: 'text-aqua-deep dark:text-cyan' },
  increase: { label: '补入', cls: 'text-aqua-deep dark:text-cyan' },
  decrease: { label: '取用', cls: 'text-orange-600 dark:text-orange-400' },
  edit: { label: '修改', cls: 'muted' },
  delete: { label: '删除', cls: 'text-red-500 dark:text-red-400' },
  'purge-location': { label: '位置移除', cls: 'text-red-500 dark:text-red-400' },
}

const groups = computed(() => {
  const map = new Map()
  for (const h of state.history) {
    const key = dayLabel(h.time)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(h)
  }
  return [...map.entries()]
})

async function onClear() {
  const ok = await confirm({
    title: '清空历史记录？',
    message: '只清空操作流水，不影响当前库存。此操作不可恢复。',
    danger: true,
    confirmText: '清空',
  })
  if (ok) clearHistory()
}
</script>

<template>
  <div class="mt-5">
    <div v-if="state.history.length" class="mb-3 flex items-center justify-between px-1">
      <span class="muted text-xs">共 {{ state.history.length }} 条</span>
      <button class="btn px-2 text-xs text-ink-dim hover:text-red-500 dark:text-foam-dim" @click="onClear">
        清空历史
      </button>
    </div>

    <div v-for="([label, entries]) in groups" :key="label" class="mb-5">
      <div class="mb-2 px-1 text-xs font-medium tracking-wide muted">{{ label }}</div>
      <div class="card divide-y divide-line dark:divide-line-dark">
        <div v-for="h in entries" :key="h.id" class="flex items-center gap-3 px-4 py-2.5">
          <span class="num muted w-10 shrink-0 text-xs">{{ fmtHM(h.time) }}</span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm">
              {{ h.item.emoji }} {{ h.item.locationName }}
              <template v-if="h.item.ml"> · {{ h.item.name }} {{ fmtNum(h.item.ml) }}ml</template>
              <template v-else> · {{ h.item.name }}</template>
            </div>
            <div class="text-xs" :class="ACTION_META[h.action]?.cls">{{ ACTION_META[h.action]?.label ?? h.action }}</div>
          </div>
          <span
            v-if="h.action === 'add' || h.action === 'increase'"
            class="num shrink-0 text-sm font-semibold text-aqua-deep dark:text-cyan"
          >
            +{{ h.delta }}
          </span>
          <span
            v-else-if="h.action === 'decrease'"
            class="num shrink-0 text-sm font-semibold text-orange-600 dark:text-orange-400"
          >
            −{{ Math.abs(h.delta) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!state.history.length" class="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-[13px] muted dark:border-line-dark">
      还没有操作记录，添加或取用水后这里会出现流水
    </div>
  </div>
</template>
