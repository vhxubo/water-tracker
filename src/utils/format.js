export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

// 6,600 这样带千分位，纯数字场景用
export function fmtNum(n) {
  return Number(n || 0).toLocaleString('zh-CN')
}

// 大毫升数附一个升数：6,600 ml（≈6.6 L）
export function fmtL(ml) {
  if (!ml) return '0 L'
  const l = ml / 1000
  return `≈${l % 1 === 0 ? l : l.toFixed(1)} L`
}

export function relTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 2 * day) return `昨天 ${fmtHM(ts)}`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return fmtMD(ts)
}

export function fmtHM(ts) {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtMD(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function fmtFull(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}年${fmtMD(ts)} ${fmtHM(ts)}`
}

// 历史分组用：今天 / 昨天 / 10月8日 / 2025年12月3日
export function dayLabel(ts) {
  const d = new Date(ts)
  const now = new Date()
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (d.getFullYear() === now.getFullYear()) return fmtMD(ts)
  return `${d.getFullYear()}年${fmtMD(ts)}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Date -> datetime-local 输入框的值（本地时区）
export function toLocalInput(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// datetime-local 输入框的值 -> 时间戳，无效时返回 null
export function fromLocalInput(str) {
  if (!str) return null
  const ts = new Date(str).getTime()
  return Number.isNaN(ts) ? null : ts
}
