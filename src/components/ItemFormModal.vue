<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { useStore } from '../composables/useStore'
import { WATER_PRESETS, PURPOSE_PRESETS } from '../constants/presets'
import { toLocalInput, fromLocalInput } from '../utils/format'

const props = defineProps({
  open: { type: Boolean, required: true },
  // null = 新增，对象 = 编辑
  item: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const confirm = inject('confirm')
const { state, addItem, updateItem, removeItem } = useStore()

const form = reactive({
  locationId: '',
  name: '',
  ml: '',
  count: 1,
  purpose: '',
  note: '',
  time: '',
})
const errorMsg = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    errorMsg.value = ''
    if (props.item) {
      Object.assign(form, {
        locationId: props.item.locationId,
        name: props.item.name,
        ml: String(props.item.ml),
        count: props.item.count,
        purpose: props.item.purpose,
        note: props.item.note,
        time: toLocalInput(props.item.createdAt),
      })
    } else {
      Object.assign(form, {
        locationId: state.locations[0]?.id ?? '',
        name: '',
        ml: '',
        count: 1,
        purpose: '',
        note: '',
        time: toLocalInput(Date.now()),
      })
    }
    document.body.style.overflow = 'hidden'
  },
  { immediate: true },
)

watch(
  () => props.open,
  (open) => {
    if (!open) document.body.style.overflow = ''
  },
)

const isEdit = computed(() => !!props.item)
const activePresetIdx = computed(() =>
  WATER_PRESETS.findIndex((p) => p.name === form.name.trim() && String(p.ml) === String(form.ml).trim()),
)

function pickPreset(p) {
  form.name = p.name
  form.ml = String(p.ml)
}

const valid = computed(() => {
  const ml = Number(form.ml)
  return (
    form.locationId &&
    form.name.trim() &&
    Number.isFinite(ml) &&
    ml > 0 &&
    form.count >= 1 &&
    (fromLocalInput(form.time) !== null)
  )
})

function stepCount(d) {
  form.count = Math.max(1, form.count + d)
}

function setNow() {
  form.time = toLocalInput(Date.now())
}

function save() {
  if (!valid.value) {
    errorMsg.value = '请补全：位置、水的名称、毫升数都要填'
    return
  }
  const payload = {
    locationId: form.locationId,
    name: form.name,
    ml: Number(form.ml),
    count: form.count,
    purpose: form.purpose,
    note: form.note,
    createdAt: fromLocalInput(form.time) ?? Date.now(),
  }
  if (isEdit.value) updateItem(props.item.id, payload)
  else addItem(payload)
  emit('close')
}

async function del() {
  const ok = await confirm({
    title: '删除这条记录？',
    message: `「${props.item.name} ${props.item.ml}ml × ${props.item.count}」将被移出清单。`,
    danger: true,
    confirmText: '删除',
  })
  if (!ok) return
  removeItem(props.item.id)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 bg-black/40" @click="emit('close')" />
    </Transition>
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] dark:bg-deep"
        role="dialog"
        aria-modal="true"
        :aria-label="isEdit ? '编辑存水' : '添加存水'"
      >
        <div class="sticky top-0 flex items-center justify-between bg-white px-5 pb-3 pt-4 dark:bg-deep">
          <h2 class="text-base font-semibold">{{ isEdit ? '编辑存水' : '添加存水' }}</h2>
          <button class="btn h-8 w-8 rounded-full muted text-xl" aria-label="关闭" @click="emit('close')">×</button>
        </div>

        <div class="space-y-5 px-5">
          <!-- 位置 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">放在哪里</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="loc in state.locations"
                :key="loc.id"
                class="chip"
                :class="{ 'chip-on': form.locationId === loc.id }"
                @click="form.locationId = loc.id"
              >
                {{ loc.emoji }} {{ loc.name }}
              </button>
            </div>
          </div>

          <!-- 水 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">什么水（点选或自己填）</div>
            <div class="mb-2.5 flex flex-wrap gap-2">
              <button
                v-for="(p, i) in WATER_PRESETS"
                :key="p.name + p.ml"
                class="chip"
                :class="{ 'chip-on': activePresetIdx === i }"
                @click="pickPreset(p)"
              >
                {{ p.name }} <span class="num text-xs opacity-75">{{ p.ml }}ml</span>
              </button>
            </div>
            <div class="grid grid-cols-[1fr_7rem] gap-2">
              <input v-model.trim="form.name" class="field" placeholder="名称，如 农夫山泉" />
              <input v-model.trim="form.ml" class="field num" inputmode="numeric" placeholder="毫升/瓶" />
            </div>
          </div>

          <!-- 瓶数 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">瓶数</div>
            <div class="flex items-center gap-3">
              <button
                class="btn h-11 w-11 rounded-full border border-line text-xl text-ink-dim dark:border-line-dark dark:text-foam-dim"
                :disabled="form.count <= 1"
                aria-label="减少瓶数"
                @click="stepCount(-1)"
              >
                −
              </button>
              <span class="num w-12 text-center text-2xl font-semibold">{{ form.count }}</span>
              <button
                class="btn h-11 w-11 rounded-full border border-aqua text-xl text-aqua dark:border-cyan dark:text-cyan"
                aria-label="增加瓶数"
                @click="stepCount(1)"
              >
                ＋
              </button>
            </div>
          </div>

          <!-- 用途 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">用途（可选）</div>
            <div class="mb-2.5 flex flex-wrap gap-2">
              <button
                v-for="p in PURPOSE_PRESETS"
                :key="p"
                class="chip"
                :class="{ 'chip-on': form.purpose === p }"
                @click="form.purpose = form.purpose === p ? '' : p"
              >
                {{ p }}
              </button>
            </div>
            <input v-model.trim="form.purpose" class="field" placeholder="自定义用途" />
          </div>

          <!-- 时间 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">记录时间</div>
            <div class="flex items-center gap-2">
              <input v-model="form.time" type="datetime-local" class="field flex-1" />
              <button class="btn h-11 shrink-0 rounded-xl border border-line px-3 text-sm muted dark:border-line-dark" @click="setNow">
                现在
              </button>
            </div>
          </div>

          <!-- 备注 -->
          <div>
            <div class="mb-2 text-xs font-medium tracking-wide muted">备注（可选）</div>
            <input v-model.trim="form.note" class="field" placeholder="如 后备箱左侧" />
          </div>

          <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
        </div>

        <div class="mt-6 flex gap-2 px-5">
          <button
            v-if="isEdit"
            class="btn h-12 w-12 shrink-0 rounded-2xl border border-red-300 text-red-500 dark:border-red-500/40 dark:text-red-400"
            :aria-label="'删除' + item?.name"
            @click="del"
          >
            🗑
          </button>
          <button
            class="btn h-12 flex-1 rounded-2xl bg-aqua text-base font-medium text-white dark:bg-cyan dark:text-abyss"
            :disabled="!valid"
            @click="save"
          >
            {{ isEdit ? '保存修改' : '添加' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
