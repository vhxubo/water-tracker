// 首次使用时预置的示例位置，可随意修改或删除
export const DEFAULT_LOCATIONS = [
  { id: 'car', name: '车里', emoji: '🚗' },
  { id: 'fridge-cold', name: '冷藏层', emoji: '❄️' },
  { id: 'fridge-freezer', name: '冷冻层', emoji: '🧊' },
]

// 内置常见瓶装水（国内常见 + 国际品牌），点选后自动填入名称和毫升数
export const WATER_PRESETS = [
  { name: '农夫山泉', ml: 550 },
  { name: '农夫山泉', ml: 380 },
  { name: '怡宝', ml: 555 },
  { name: '百岁山', ml: 570 },
  { name: '百岁山', ml: 348 },
  { name: '娃哈哈', ml: 596 },
  { name: '康师傅优悦', ml: 550 },
  { name: '冰露', ml: 550 },
  { name: '冰露', ml: 330 },
  { name: '今麦郎凉白开', ml: 550 },
  { name: '恒大冰泉', ml: 500 },
  { name: 'evian 依云', ml: 500 },
  { name: 'evian 依云', ml: 330 },
  { name: 'San Pellegrino 圣培露', ml: 500 },
  { name: 'VOSS', ml: 375 },
  { name: '农夫山泉（大瓶）', ml: 1900 },
]

// 常见用途，也支持自定义输入
export const PURPOSE_PRESETS = ['日常饮用', '应急备用', '运动补水', '泡茶', '待客']

// 位置可选图标
export const LOCATION_EMOJIS = [
  '🚗', '❄️', '🧊', '🏠', '🏢', '🛒', '🎒', '📦',
  '💼', '⛺', '🚲', '🗄️', '🥤', '🌊', '🏖️', '🚢',
  '🔥', '💧',
]

// 位置配色（水深渐变系列，循环取用）
export const LOC_COLORS = ['#1290b4', '#43bac4', '#84d6e6', '#336f8f', '#b7e4ee']

export function locColor(index) {
  return LOC_COLORS[index % LOC_COLORS.length]
}
