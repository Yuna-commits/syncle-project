// 날짜 상태에 따른 스타일 및 텍스트 반환
export const getDateStatusStyle = (dueDate) => {
  // 기본 스타일 (날짜 없음)
  const defaultStyle = {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-500',
    dateLabel: null,
  }

  if (!dueDate) return defaultStyle

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 날짜 포맷 (예: 12월 25일)
  const dateText = due.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  // 1. 마감 지남 (Overdue) - 붉은색 배경
  if (diffDays < 0) {
    return {
      bg: 'bg-red-100 hover:bg-red-200',
      border: 'border-red-300',
      text: 'text-red-700 font-bold',
      dateLabel: `${dateText} (지남)`,
    }
  }
  // 2. 오늘 마감 (Due Today) - 주황색 (가장 눈에 띄게)
  else if (diffDays === 0) {
    return {
      bg: 'bg-orange-100 hover:bg-orange-200',
      border: 'border-orange-300',
      text: 'text-orange-800 font-bold',
      dateLabel: '오늘 마감',
    }
  }
  // 3. 마감 임박 (3일 내) - 노란색 (주의)
  else if (diffDays <= 3) {
    return {
      bg: 'bg-yellow-100 hover:bg-yellow-200',
      border: 'border-yellow-300',
      text: 'text-yellow-600',
      dateLabel: `${dateText} (${diffDays}일 남음)`, // 남은 일수 표시
    }
  }
  // 4. 일반 (여유 있음) - 기본 흰색
  else {
    return {
      ...defaultStyle,
      dateLabel: dateText,
    }
  }
}
