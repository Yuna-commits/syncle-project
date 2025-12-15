import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'

export const useCalendarMutations = () => {
  const queryClient = useQueryClient()

  // (예시) 일정 날짜 변경 (드래그 앤 드롭 등)
  const updateEventDateMutation = useMutation({
    mutationFn: ({ cardId, startDate, dueDate }) =>
      boardApi.updateCard(cardId, { startDate, dueDate }),

    onSuccess: () => {
      // 캘린더 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['myCalendarEvents'] })
      // 개별 보드 데이터도 갱신 (만약 보고 있다면)
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
    onError: (err) => {
      alert(err.response?.data?.message || '일정 변경에 실패했습니다.')
    },
  })

  return {
    updateEventDate: updateEventDateMutation.mutate,
  }
}
