import { reactive, computed, watch } from 'vue'
import { DEFAULT_LOCATIONS } from '../constants/presets'
import { uid } from '../utils/format'

const STORAGE_KEY = 'water-tracker:v1'
const VERSION = 1

function seed() {
  return {
    version: VERSION,
    locations: DEFAULT_LOCATIONS.map((l) => ({ ...l })),
    items: [],
    history: [],
  }
}

function isValidLocation(l) {
  return l && typeof l.id === 'string' && typeof l.name === 'string' && l.name.trim() && typeof l.emoji === 'string'
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const data = JSON.parse(raw)
    if (data?.version !== VERSION || !Array.isArray(data.locations) || !Array.isArray(data.items)) {
      return seed()
    }
    const locations = data.locations.filter(isValidLocation)
    if (!locations.length) return seed()
    const locIds = new Set(locations.map((l) => l.id))
    const items = data.items
      .filter(
        (i) =>
          i &&
          locIds.has(i.locationId) &&
          typeof i.name === 'string' &&
          i.name.trim() &&
          Number(i.ml) > 0 &&
          Number(i.count) >= 0,
      )
      .map((i) => ({
        id: typeof i.id === 'string' ? i.id : uid(),
        locationId: i.locationId,
        name: i.name,
        ml: Number(i.ml),
        count: Number(i.count),
        purpose: typeof i.purpose === 'string' ? i.purpose : '',
        note: typeof i.note === 'string' ? i.note : '',
        createdAt: Number(i.createdAt) || Date.now(),
        updatedAt: Number(i.updatedAt) || Date.now(),
      }))
    const history = Array.isArray(data.history) ? data.history.filter((h) => h && typeof h.time === 'number') : []
    return { version: VERSION, locations, items, history }
  } catch {
    return seed()
  }
}

// 模块级单例，全应用共享同一份状态
const state = reactive(loadState())

watch(
  state,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* 存储满了等情况，静默失败，内存中仍可用 */
    }
  },
  { deep: true },
)

function locById(id) {
  return state.locations.find((l) => l.id === id)
}

function snap(item) {
  const loc = locById(item.locationId)
  return {
    name: item.name,
    ml: item.ml,
    locationName: loc ? loc.name : '已删位置',
    emoji: loc ? loc.emoji : '🗑️',
  }
}

function pushHistory(action, item, delta, time) {
  state.history.unshift({
    id: uid(),
    time: time ?? Date.now(),
    action, // add | increase | decrease | edit | delete | purge-location
    delta: delta ?? 0,
    item: snap(item),
  })
  // 历史上限，防止无限膨胀
  if (state.history.length > 500) state.history.length = 500
}

export function useStore() {
  const totals = computed(() => {
    let bottles = 0
    let ml = 0
    for (const it of state.items) {
      bottles += it.count
      ml += it.count * it.ml
    }
    return { bottles, ml }
  })

  // 按位置顺序分组，组内按记录时间倒序
  const locationStats = computed(() =>
    state.locations.map((loc) => {
      const items = state.items
        .filter((i) => i.locationId === loc.id)
        .sort((a, b) => b.createdAt - a.createdAt)
      const bottles = items.reduce((s, i) => s + i.count, 0)
      const ml = items.reduce((s, i) => s + i.count * i.ml, 0)
      return { location: loc, items, bottles, ml }
    }),
  )

  return {
    state,
    totals,
    locationStats,

    // ---- 条目 ----
    addItem({ locationId, name, ml, count, purpose, note, createdAt }) {
      const item = {
        id: uid(),
        locationId,
        name: name.trim(),
        ml: Math.round(Number(ml)),
        count: Number(count),
        purpose: (purpose || '').trim(),
        note: (note || '').trim(),
        createdAt: createdAt ?? Date.now(),
        updatedAt: Date.now(),
      }
      state.items.push(item)
      pushHistory('add', item, item.count, item.createdAt)
      return item
    },

    updateItem(id, patch) {
      const item = state.items.find((i) => i.id === id)
      if (!item) return
      Object.assign(item, {
        locationId: patch.locationId,
        name: patch.name.trim(),
        ml: Math.round(Number(patch.ml)),
        count: Number(patch.count),
        purpose: (patch.purpose || '').trim(),
        note: (patch.note || '').trim(),
        createdAt: patch.createdAt ?? item.createdAt,
        updatedAt: Date.now(),
      })
      pushHistory('edit', item, item.count)
    },

    adjustCount(id, delta) {
      const item = state.items.find((i) => i.id === id)
      if (!item || delta === 0) return
      item.count = Math.max(0, item.count + delta)
      item.updatedAt = Date.now()
      pushHistory(delta > 0 ? 'increase' : 'decrease', item, delta)
    },

    removeItem(id) {
      const idx = state.items.findIndex((i) => i.id === id)
      if (idx === -1) return
      const [item] = state.items.splice(idx, 1)
      pushHistory('delete', item, -item.count)
    },

    // ---- 位置 ----
    addLocation(name, emoji) {
      const loc = { id: uid(), name: name.trim(), emoji: emoji || '📍' }
      state.locations.push(loc)
      return loc
    },

    updateLocation(id, name, emoji) {
      const loc = locById(id)
      if (!loc) return
      loc.name = name.trim() || loc.name
      if (emoji) loc.emoji = emoji
    },

    moveLocation(id, dir) {
      const idx = state.locations.findIndex((l) => l.id === id)
      const to = idx + dir
      if (idx === -1 || to < 0 || to >= state.locations.length) return
      const [loc] = state.locations.splice(idx, 1)
      state.locations.splice(to, 0, loc)
    },

    // 删除位置及其下所有条目（调用方需先确认）
    removeLocation(id) {
      const loc = locById(id)
      if (!loc) return
      const removed = state.items.filter((i) => i.locationId === id)
      state.items = state.items.filter((i) => i.locationId !== id)
      state.locations = state.locations.filter((l) => l.id !== id)
      state.history.unshift({
        id: uid(),
        time: Date.now(),
        action: 'purge-location',
        delta: 0,
        item: { name: `${loc.name}（含 ${removed.length} 条记录）`, ml: 0, locationName: loc.name, emoji: loc.emoji },
      })
    },

    // ---- 数据 ----
    exportData() {
      return JSON.stringify({ app: 'water-tracker', exportedAt: new Date().toISOString(), ...JSON.parse(JSON.stringify(state)) }, null, 2)
    },

    // 返回错误信息，成功返回 null
    importData(text) {
      let data
      try {
        data = JSON.parse(text)
      } catch {
        return '文件不是有效的 JSON'
      }
      if (!data || !Array.isArray(data.locations) || !Array.isArray(data.items)) {
        return '文件格式不符合水量记录导出格式'
      }
      const locations = data.locations.filter(isValidLocation)
      if (!locations.length) return '文件里没有可用的位置信息'
      const locIds = new Set(locations.map((l) => l.id))
      const items = data.items.filter(
        (i) => i && locIds.has(i.locationId) && typeof i.name === 'string' && Number(i.ml) > 0 && Number(i.count) >= 0,
      )
      state.locations = locations
      state.items = items.map((i) => ({
        id: typeof i.id === 'string' ? i.id : uid(),
        locationId: i.locationId,
        name: i.name,
        ml: Number(i.ml),
        count: Number(i.count),
        purpose: typeof i.purpose === 'string' ? i.purpose : '',
        note: typeof i.note === 'string' ? i.note : '',
        createdAt: Number(i.createdAt) || Date.now(),
        updatedAt: Number(i.updatedAt) || Date.now(),
      }))
      state.history = Array.isArray(data.history) ? data.history.filter((h) => h && typeof h.time === 'number') : []
      return null
    },

    clearHistory() {
      state.history = []
    },

    clearAll() {
      const fresh = seed()
      state.locations = fresh.locations
      state.items = fresh.items
      state.history = fresh.history
    },
  }
}
