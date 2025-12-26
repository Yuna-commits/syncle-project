/**
 * 보드 필터링 및 정렬 유틸리티
 * @param {Array} tasks - 필터링할 카드 목록
 * @param {Object} filter - 필터 조건 객체 (keyword, memberIds, labels, priorities, dueDates, sortBy)
 * @returns {Array} 필터링 및 정렬된 카드 목록
 */
export const filterAndSortTasks = (tasks, filter) => {
  if (!tasks) return []

  // 원본 배열 보호를 위해 복사
  let result = [...tasks]

  // 1. 필터링 로직
  result = result.filter((task) => {
    // 키워드 검색
    if (
      filter.keyword &&
      !task.title.toLowerCase().includes(filter.keyword.toLowerCase())
    ) {
      return false
    }

    // 멤버 필터
    if (filter.memberIds.length > 0) {
      if (!task.assignee || !filter.memberIds.includes(task.assignee.id))
        return false
    }

    // 라벨 필터
    if (filter.labels.length > 0) {
      if (!task.label || !filter.labels.includes(task.label)) return false
    }

    // 우선순위 필터
    if (filter.priorities.length > 0) {
      if (!filter.priorities.includes(task.priority)) return false
    }

    // 마감일 & 상태 필터
    if (filter.dueDates.length > 0) {
      let match = false
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filter.dueDates.includes('completed') && task.isComplete) match = true
      if (filter.dueDates.includes('noDueDate') && !task.dueDate) match = true

      if (task.dueDate) {
        const due = new Date(task.dueDate)
        due.setHours(0, 0, 0, 0)
        const diffDays = (due - today) / (1000 * 60 * 60 * 24)

        if (filter.dueDates.includes('overdue') && diffDays < 0) match = true
        if (
          filter.dueDates.includes('dueTomorrow') &&
          diffDays > 0 &&
          diffDays <= 1
        )
          match = true
      }

      if (!match) return false
    }

    return true
  })

  // 2. 정렬 로직
  result.sort((a, b) => {
    if (a.isComplete && b.isComplete) {
      return b.id - a.id
    }
    switch (filter.sortBy) {
      case 'manual': // [추가] 사용자 지정 순서 (기본값)
        return a.order - b.order
      case 'newest':
        return b.id - a.id
      case 'oldest':
        return a.id - b.id
      case 'priority_high': {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        const aVal = pMap[a.priority] || 0
        const bVal = pMap[b.priority] || 0
        return bVal - aVal
      }
      case 'due_date': {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      default:
        return a.order - b.order
    }
  })

  return result
}
