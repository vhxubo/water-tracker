<script setup>
import { provide, reactive, ref } from 'vue'
import { useStore } from './composables/useStore'
import SummaryHero from './components/SummaryHero.vue'
import InventoryView from './components/InventoryView.vue'
import HistoryView from './components/HistoryView.vue'
import ItemFormModal from './components/ItemFormModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const { totals, locationStats } = useStore()

const tab = ref('stock') // stock | history
const formOpen = ref(false)
const editingItem = ref(null)
const settingsOpen = ref(false)

function openAdd() {
  editingItem.value = null
  formOpen.value = true
}
function openEdit(item) {
  editingItem.value = item
  formOpen.value = true
}

// 全局确认框：const ok = await confirm({ title, message, danger?, confirmText? })
const confirmState = reactive({ open: false, title: '', message: '', danger: false, confirmText: '确认', resolve: null })
function askConfirm(opts) {
  return new Promise((resolve) => {
    Object.assign(confirmState, { open: true, danger: false, confirmText: '确认', ...opts, resolve })
  })
}
provide('confirm', askConfirm)
</script>

<template>
  <div class="min-h-dvh">
    <div class="mx-auto max-w-md px-4 pb-32">
      <!-- 顶栏 -->
      <header class="flex items-center justify-between pt-5">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">水量记录</h1>
          <div class="muted text-[10px] font-medium uppercase tracking-[0.3em]">Water Level</div>
        </div>
        <button
          class="btn h-10 w-10 rounded-full border border-line bg-white text-base dark:border-line-dark dark:bg-deep"
          aria-label="设置"
          @click="settingsOpen = true"
        >
          ⚙️
        </button>
      </header>

      <SummaryHero :location-stats="locationStats" :totals="totals" />

      <!-- 视图切换 -->
      <nav class="mt-5 flex rounded-full border border-line bg-white p-1 dark:border-line-dark dark:bg-deep" aria-label="视图切换">
        <button
          v-for="t in [
            { id: 'stock', label: '库存' },
            { id: 'history', label: '历史' },
          ]"
          :key="t.id"
          class="btn h-9 flex-1 rounded-full text-sm"
          :class="tab === t.id ? 'bg-aqua font-medium text-white dark:bg-cyan dark:text-abyss' : 'muted'"
          :aria-pressed="tab === t.id"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>

      <InventoryView v-if="tab === 'stock'" :location-stats="locationStats" @edit="openEdit" />
      <HistoryView v-else />

      <footer class="mt-10 text-center text-[11px] muted">
        数据仅保存在本机浏览器 · 记得在设置里导出备份
      </footer>
    </div>

    <!-- 添加按钮 -->
    <Transition name="fade">
      <button
        v-if="tab === 'stock'"
        class="btn fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 z-40 h-13 -translate-x-1/2 rounded-full bg-aqua px-7 text-[15px] font-medium text-white shadow-lg shadow-aqua/30 dark:bg-cyan dark:text-abyss dark:shadow-cyan/20"
        @click="openAdd"
      >
        ＋ 添加水
      </button>
    </Transition>

    <ItemFormModal :open="formOpen" :item="editingItem" @close="formOpen = false" />
    <SettingsModal :open="settingsOpen" @close="settingsOpen = false" />

    <ConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :danger="confirmState.danger"
      :confirm-text="confirmState.confirmText"
      @close="() => { confirmState.open = false; confirmState.resolve?.(false) }"
      @confirm="() => { confirmState.open = false; confirmState.resolve?.(true) }"
    />
  </div>
</template>
