<script setup>
import { inject, ref, watch } from 'vue'
import { useStore } from '../composables/useStore'
import { LOCATION_EMOJIS } from '../constants/presets'

const props = defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])

const confirm = inject('confirm')
const { state, addLocation, updateLocation, moveLocation, removeLocation, exportData, importData, clearAll } = useStore()

const msg = ref('')
let msgTimer = null
function flash(text) {
  msg.value = text
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => (msg.value = ''), 3000)
}

// ---- 位置管理 ----
const newName = ref('')
const newEmoji = ref('📍')
const emojiEditId = ref(null) // 正在换图标的位置 id 或 'new'

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      msg.value = ''
      newName.value = ''
      newEmoji.value = '📍'
      emojiEditId.value = null
    }
  },
  { immediate: true },
)

function toggleEmojiPicker(id) {
  emojiEditId.value = emojiEditId.value === id ? null : id
}

function chooseEmoji(emoji, id) {
  if (id === 'new') newEmoji.value = emoji
  else {
    const loc = state.locations.find((l) => l.id === id)
    if (loc) updateLocation(id, loc.name, emoji)
  }
  emojiEditId.value = null
}

function onRename(loc) {
  if (loc.name.trim()) updateLocation(loc.id, loc.name, null)
}

function add() {
  if (!newName.value.trim()) return
  addLocation(newName.value, newEmoji.value)
  newName.value = ''
  newEmoji.value = '📍'
}

async function onRemoveLocation(loc) {
  const count = state.items.filter((i) => i.locationId === loc.id).length
  const extra = count ? `\n该位置下 ${count} 条存水记录会一并删除。` : ''
  const ok = await confirm({
    title: `删除位置「${loc.name}」？`,
    message: `位置将从清单中移除。${extra}`,
    danger: true,
    confirmText: '删除',
  })
  if (ok) removeLocation(loc.id)
}

// ---- 数据管理 ----
function doExport() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  a.href = url
  a.download = `water-tracker-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`
  a.click()
  URL.revokeObjectURL(url)
  flash('已导出备份文件')
}

async function onImportFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const ok = await confirm({
    title: '导入数据？',
    message: '导入将覆盖当前所有的位置、存水和历史记录。',
    danger: true,
    confirmText: '导入',
  })
  if (!ok) return
  const text = await file.text()
  const err = importData(text)
  flash(err ?? '导入成功')
}

async function onClearAll() {
  const ok = await confirm({
    title: '清空所有数据？',
    message: '所有位置、存水记录和历史都会被清空，恢复到初始状态。此操作不可恢复。',
    danger: true,
    confirmText: '全部清空',
  })
  if (ok) {
    clearAll()
    flash('已清空')
  }
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
        class="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] dark:bg-deep"
        role="dialog"
        aria-modal="true"
        aria-label="设置"
      >
        <div class="sticky top-0 flex items-center justify-between bg-white px-5 pb-3 pt-4 dark:bg-deep">
          <h2 class="text-base font-semibold">设置</h2>
          <button class="btn h-8 w-8 rounded-full muted text-xl" aria-label="关闭" @click="emit('close')">×</button>
        </div>

        <!-- 位置管理 -->
        <section class="px-5">
          <div class="mb-2 text-xs font-medium tracking-wide muted">存储位置</div>
          <div class="card divide-y divide-line dark:divide-line-dark">
            <div v-for="loc in state.locations" :key="loc.id" class="px-3 py-2.5">
              <div class="flex items-center gap-2">
                <button
                  class="btn h-9 w-9 shrink-0 rounded-xl border border-line text-lg dark:border-line-dark"
                  :aria-label="'更换' + loc.name + '的图标'"
                  @click="toggleEmojiPicker(loc.id)"
                >
                  {{ loc.emoji }}
                </button>
                <input
                  v-model="loc.name"
                  class="field h-9 flex-1 py-1"
                  @change="onRename(loc)"
                />
                <button
                  class="btn h-9 w-9 rounded-xl muted text-xs"
                  :disabled="state.locations.indexOf(loc) === 0"
                  :aria-label="'上移' + loc.name"
                  @click="moveLocation(loc.id, -1)"
                >
                  ↑
                </button>
                <button
                  class="btn h-9 w-9 rounded-xl muted text-xs"
                  :disabled="state.locations.indexOf(loc) === state.locations.length - 1"
                  :aria-label="'下移' + loc.name"
                  @click="moveLocation(loc.id, 1)"
                >
                  ↓
                </button>
                <button
                  class="btn h-9 w-9 rounded-xl text-red-500/80 text-sm"
                  :aria-label="'删除位置' + loc.name"
                  @click="onRemoveLocation(loc)"
                >
                  🗑
                </button>
              </div>
              <div v-if="emojiEditId === loc.id" class="mt-2 flex flex-wrap gap-1.5">
                <button
                  v-for="e in LOCATION_EMOJIS"
                  :key="e"
                  class="btn h-9 w-9 rounded-lg border border-line text-base dark:border-line-dark"
                  @click="chooseEmoji(e, loc.id)"
                >
                  {{ e }}
                </button>
              </div>
            </div>

            <!-- 新增位置 -->
            <div class="px-3 py-2.5">
              <div class="flex items-center gap-2">
                <button
                  class="btn h-9 w-9 shrink-0 rounded-xl border border-dashed border-line text-base dark:border-line-dark"
                  aria-label="选择新位置的图标"
                  @click="toggleEmojiPicker('new')"
                >
                  {{ newEmoji }}
                </button>
                <input v-model.trim="newName" class="field h-9 flex-1 py-1" placeholder="新位置名称，如 办公室" @keyup.enter="add" />
                <button class="btn h-9 rounded-xl bg-aqua px-3 text-sm text-white dark:bg-cyan dark:text-abyss" @click="add">
                  添加
                </button>
              </div>
              <div v-if="emojiEditId === 'new'" class="mt-2 flex flex-wrap gap-1.5">
                <button
                  v-for="e in LOCATION_EMOJIS"
                  :key="e"
                  class="btn h-9 w-9 rounded-lg border border-line text-base dark:border-line-dark"
                  @click="chooseEmoji(e, 'new')"
                >
                  {{ e }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 数据管理 -->
        <section class="mt-6 px-5">
          <div class="mb-2 text-xs font-medium tracking-wide muted">数据</div>
          <div class="card divide-y divide-line dark:divide-line-dark text-sm">
            <button class="flex w-full items-center justify-between px-4 py-3.5" @click="doExport">
              <span>导出备份（JSON）</span>
              <span class="muted">↓</span>
            </button>
            <label class="flex w-full cursor-pointer items-center justify-between px-4 py-3.5">
              <span>导入备份</span>
              <span class="muted">↑</span>
              <input type="file" accept="application/json,.json" class="hidden" @change="onImportFile" />
            </label>
            <button class="flex w-full items-center justify-between px-4 py-3.5 text-red-500" @click="onClearAll">
              <span>清空所有数据</span>
              <span>🗑</span>
            </button>
          </div>
          <p v-if="msg" class="mt-3 text-center text-xs" :class="msg.includes('成功') || msg.includes('导出') || msg.includes('清空') ? 'text-aqua-deep dark:text-cyan' : 'text-red-500'">
            {{ msg }}
          </p>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
