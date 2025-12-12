/**
 * 카드 우선순위 관련 상수 정의
 */
export const PRIORITY_OPTIONS = [
  {
    key: 'HIGH',
    label: '높음',
    // 뱃지 배경/글자색 (CardSidebar, TaskCard 공통)
    color: 'bg-red-100 text-red-700',
    // 마우스 호버 시 색상 (CardSidebar 메뉴용)
    hoverColor: 'hover:bg-red-200',
    // 아이콘 색상 (CardSidebar 메뉴용)
    iconColor: 'text-red-500',
    // 테두리 색상 (TaskCard용)
    border: 'border-red-200',
  },
  {
    key: 'MEDIUM',
    label: '보통',
    color: 'bg-orange-100 text-orange-700',
    hoverColor: 'hover:bg-orange-200',
    iconColor: 'text-orange-500',
    border: 'border-orange-200',
  },
  {
    key: 'LOW',
    label: '낮음',
    color: 'bg-green-100 text-green-700',
    hoverColor: 'hover:bg-green-200',
    iconColor: 'text-green-500',
    border: 'border-green-200',
  },
]

export const LABEL_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Black', value: '#1f2937' },
]

// TaskCard 등에서 쉽게 쓰기 위한 Helper 객체 (자동 생성)
export const PRIORITY_LABELS = PRIORITY_OPTIONS.reduce((acc, curr) => {
  acc[curr.key] = curr.label
  return acc
}, {})

export const PRIORITY_STYLES = PRIORITY_OPTIONS.reduce((acc, curr) => {
  // 배경 + 글자 + 테두리 조합
  acc[curr.key] = `${curr.color} ${curr.border}`
  return acc
}, {})
