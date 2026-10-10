<script setup>
import { computed } from 'vue'
import ItemCard from './ItemCard.vue'
import { useStore } from '../composables/useStore'
import { fmtNum } from '../utils/format'
import { locColor } from '../constants/presets'

const props = defineProps({
  locationStats: { type: Array, required: true },
})
const emit = defineEmits(['edit'])

const { adjustCount, removeItem } = useStore()

// 组内水位管：以存量最多的位置为满刻度
const maxMl = computed(() => Math.max(1, ...props.locationStats.map((s) => s.ml)))
</script>

<template>
  <div class="mt-5 space-y-6">
    <section v-for="(stat, i) in locationStats" :key="stat.location.id">
      <!-- 位置组头 -->
      <div class="mb-2.5 flex items-center gap-2.5 px-1">
        <div class="relative h-8 w-2.5 overflow-hidden rounded-full border border-line dark:border-line-dark" aria-hidden="true">
          <div
            class="absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-500"
            :style="{ height: (stat.ml / maxMl) * 100 + '%', backgroundColor: locColor(i) }"
          />
        </div>
        <h2 class="text-[15px] font-semibold">{{ stat.location.emoji }} {{ stat.location.name }}</h2>
        <span class="num muted ml-auto text-xs">
          {{ fmtNum(stat.bottles) }} 瓶 · {{ fmtNum(stat.ml) }} ml
        </span>
      </div>

      <!-- 条目 -->
      <div v-if="stat.items.length" class="space-y-2">
        <ItemCard
          v-for="item in stat.items"
          :key="item.id"
          :item="item"
          @adjust="({ id, delta }) => adjustCount(id, delta)"
          @edit="(it) => emit('edit', it)"
          @remove="(id) => removeItem(id)"
        />
      </div>
      <div v-else class="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-[13px] muted dark:border-line-dark">
        这里还没有存水
      </div>
    </section>
  </div>
</template>
