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

// 2. 팀 프로필용 단색 프리셋 (사이드바 통일용)
export const TEAM_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
]

// [Helper] 보드 객체를 받아서 테마 반환
export const getBoardTheme = (board) => {
  if (!board) return BOARD_THEMES[0]

  // 1순위: 사용자가 직접 저장한 theme 값이 있다면 사용 (DB에 컬럼이 있다고 가정)
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

  // 특수 케이스: NullPointer 팀
  if (teamName.toLowerCase().includes('nullpointer')) {
    return 'bg-gray-900 border border-gray-700' // 전용 블랙 테마
  }

  // 그 외: 이름 해시 기반 색상 배정
  let hash = 0
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % TEAM_COLORS.length
  return TEAM_COLORS[index]
}
