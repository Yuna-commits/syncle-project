import { useQuery } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'

// 캘린더 이벤트 데이터 정규화 (Server -> FullCalendar)
const normalizeCalendarEvents = (cards) => {
  if (!cards) return []

  return cards.map((card) => {
    const hasLabel = !!card.labelColor
    // 완료 여부 (1 or true)
    const isCompleted = card.isComplete === true || card.isComplete === 1

    return {
      id: String(card.id),
      title: card.title,
      start: card.startDate || card.dueDate,
      end: card.dueDate,

      // 색상 처리
      backgroundColor: hasLabel ? card.labelColor : '#F3F4F6',
      borderColor: hasLabel ? 'transparent' : '#E5E7EB',
      textColor: hasLabel ? '#ffffff' : '#1F2937',

      // 추가 정보
      extendedProps: {
        cardId: card.id,
        boardId: card.boardId,
        assigneeId: card.assigneeId,
        description: card.description,
        priority: card.priority,
        boardTitle: card.boardTitle,
        listTitle: card.listTitle,
        isComplete: isCompleted,
        hasLabel: hasLabel,
      },

      // 기본 스타일 클래스
      classNames: [
        'mb-1',
        'shadow-sm',
        'border',
        isCompleted ? 'opacity-60' : '',
      ],
    }
  })
}

// 내 카드 일정 조회 훅
export const useCalendarEventsQuery = ({ teamId, boardId }) => {
  return useQuery({
    queryKey: ['myCalendarEvents', teamId, boardId],
    queryFn: async () => {
      const params = {}
      if (teamId) params.teamId = teamId
      if (boardId) params.boardId = boardId

      const response = await boardApi.fetchMyCards(params)
      console.log(response.data.data)
      return normalizeCalendarEvents(response.data.data)
    },
    initialData: [],
    keepPreviousData: true, // 필터 변경 시 깜빡임 방지
  })
}
