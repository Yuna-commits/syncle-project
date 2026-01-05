// 1. 단순 날짜 포맷 (YYYY. MM. DD) -> 게시글 날짜, 공지 날짜 등
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 2. 상대 시간 포맷 ("방금 전", "5분 전") -> 알림, 댓글 등
export const formatRelativeTime = (dateData) => {
  if (!dateData) return ''

  let date
  // 백엔드에서 [2024, 1, 1, 12, 0] 배열로 올 경우 대응
  if (Array.isArray(dateData)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateData
    date = new Date(year, month - 1, day, hour, minute, second)
  } else {
    date = new Date(dateData)
  }

  const now = new Date()
  const diffMin = Math.floor((now - date) / (1000 * 60))

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`

  // 24시간 지나면 날짜로 표시
  return formatDate(date) // 위의 formatDate 함수 재활용
}

// 3. 타이머 포맷 (초 -> "MM:SS") -> 인증 타이머, 스톱워치 등
export const formatTimer = (timeInSeconds) => {
  if (timeInSeconds < 0) return '00:00'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

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
