<script setup>
import { computed, onMounted, ref } from 'vue'
import { fmtNum, fmtL } from '../utils/format'
import { locColor } from '../constants/presets'

const props = defineProps({
  locationStats: { type: Array, required: true },
  totals: { type: Object, required: true },
})

const ready = ref(false)
onMounted(() => requestAnimationFrame(() => (ready.value = true)))

const segments = computed(() => {
  const { ml } = props.totals
  return props.locationStats.map((s, i) => ({
    ...s,
    color: locColor(i),
    pct: ml > 0 ? (s.ml / ml) * 100 : 0,
  }))
})
</script>

<template>
  <section class="card mt-4 overflow-hidden">
    <div class="px-5 pt-5">
      <div class="flex items-end justify-between">
        <div>
          <div class="muted text-xs font-medium tracking-wide">库存水位 TOTAL</div>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="num text-5xl font-semibold" :class="totals.bottles === 0 ? 'opacity-30' : ''">
              {{ fmtNum(totals.bottles) }}
            </span>
            <span class="muted text-sm">瓶</span>
          </div>
        </div>
        <div class="text-right">
          <div class="num text-2xl font-medium" :class="totals.bottles === 0 ? 'opacity-30' : ''">
            {{ fmtNum(totals.ml) }}
          </div>
          <div class="muted text-xs">ml <template v-if="totals.ml >= 1000">（{{ fmtL(totals.ml) }}）</template></div>
        </div>
      </div>

      <!-- 刻度尺 + 水位条 -->
      <div class="ticks mt-4" />
      <div class="mt-1 flex h-3 overflow-hidden rounded-full bg-line dark:bg-line-dark">
        <div
          v-for="seg in segments"
          :key="seg.location.id"
          class="h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full"
          :style="{ width: (ready ? seg.pct : 0) + '%', backgroundColor: seg.color }"
        />
      </div>
    </div>

    <!-- 图例 -->
    <div class="flex flex-wrap gap-x-4 gap-y-1.5 px-5 py-3.5 text-[13px]">
      <span v-for="seg in segments" :key="seg.location.id" class="inline-flex items-center gap-1.5">
        <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: seg.color }" />
        <span>{{ seg.location.emoji }} {{ seg.location.name }}</span>
        <span class="num muted">{{ fmtNum(seg.bottles) }} 瓶</span>
      </span>
    </div>

    <p v-if="totals.bottles === 0" class="border-t border-line px-5 py-3 text-center text-[13px] muted dark:border-line-dark">
      还没有存水，点右下角的「添加水」记下第一瓶
    </p>
  </section>
</template>
