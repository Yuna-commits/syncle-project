// src/constants/themeConstants.js

// 1. 보드 커버용 그라디언트 프리셋 (눈이 편안한 Deep 톤)
export const BOARD_THEMES = [
  { id: 0, from: 'from-blue-600', to: 'to-cyan-500', name: 'Ocean' },
  { id: 1, from: 'from-emerald-600', to: 'to-teal-600', name: 'Forest' },
  { id: 2, from: 'from-orange-500', to: 'to-red-600', name: 'Sunset' },
  { id: 3, from: 'from-indigo-600', to: 'to-violet-600', name: 'Berry' },
  { id: 4, from: 'from-rose-500', to: 'to-pink-600', name: 'Rose' },
  { id: 5, from: 'from-slate-600', to: 'to-slate-800', name: 'Midnight' },
  { id: 6, from: 'from-stone-500', to: 'to-stone-700', name: 'Stone' },
]

// 2. 팀 프로필용 그라디언트 프리셋 (20가지로 확장)
export const TEAM_COLORS = [
  // 1. Red & Rose 계열
  'bg-gradient-to-br from-red-500 to-rose-600',
  'bg-gradient-to-br from-rose-400 to-red-600',

  // 2. Orange & Amber 계열
  'bg-gradient-to-br from-orange-400 to-amber-600',
  'bg-gradient-to-br from-amber-400 to-orange-600',

  // 3. Yellow & Lime 계열
  'bg-gradient-to-br from-yellow-400 to-amber-600',
  'bg-gradient-to-br from-lime-400 to-green-600',

  // 4. Green & Emerald 계열
  'bg-gradient-to-br from-green-400 to-emerald-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',

  // 5. Teal & Cyan 계열
  'bg-gradient-to-br from-teal-400 to-cyan-600',
  'bg-gradient-to-br from-cyan-400 to-sky-600',

  // 6. Sky & Blue 계열
  'bg-gradient-to-br from-sky-400 to-blue-600',
  'bg-gradient-to-br from-blue-400 to-indigo-600',

  // 7. Indigo & Violet 계열
  'bg-gradient-to-br from-indigo-400 to-violet-600',
  'bg-gradient-to-br from-violet-400 to-purple-600',

  // 8. Purple & Fuchsia 계열
  'bg-gradient-to-br from-purple-400 to-fuchsia-600',
  'bg-gradient-to-br from-fuchsia-400 to-pink-600',

  // 9. Pink & Rose 계열
  'bg-gradient-to-br from-pink-400 to-rose-600',

  // 10. Grayscale 계열 (Stone, Slate, Zinc)
  'bg-gradient-to-br from-slate-400 to-slate-600',
  'bg-gradient-to-br from-gray-400 to-zinc-600',
  'bg-gradient-to-br from-stone-400 to-neutral-600',
]

// [Helper] 보드 객체를 받아서 테마 반환
export const getBoardTheme = (board) => {
  if (!board) return BOARD_THEMES[0]

  // 1순위: 사용자가 직접 저장한 theme 값이 있다면 사용
  if (board.theme !== undefined && board.theme !== null) {
    const themeIndex = Number(board.theme)
    return BOARD_THEMES[themeIndex % BOARD_THEMES.length]
  }

  // 2순위: 없다면 ID를 기반으로 자동 배정
  const idNum = Number(board.id) || 0
  return BOARD_THEMES[idNum % BOARD_THEMES.length]
}

// [Helper] 팀 이름을 받아서 고정된 색상 클래스 반환
export const getTeamColorClass = (teamName) => {
  if (!teamName) return TEAM_COLORS[0]

  // 이름 해시 기반 색상 배정
  let hash = 0
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % TEAM_COLORS.length
  return TEAM_COLORS[index]
}
