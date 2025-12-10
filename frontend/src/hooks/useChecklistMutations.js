import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../api/board.api'
import useBoardStore from '../stores/useBoardStore'

export const useChecklistMutations = (boardId) => {
  const queryClient = useQueryClient()
  // boardId가 없으면 0이나 null이 들어가 쿼리 키가 안 맞을 수 있으므로 방어
  const queryKey = ['board', Number(boardId)]

  // 낙관적 업데이트 핸들러
  const handleOptimisticUpdate = async (updateFn, variables) => {
    // 진행 중인 쿼리 취소
    await queryClient.cancelQueries({ queryKey })

    // 이전 상태 저장
    const previousBoard = queryClient.getQueryData(queryKey)

    // React Query 캐시 업데이트
    queryClient.setQueryData(queryKey, (oldBoard) => {
      if (!oldBoard) return oldBoard

      const newBoard = updateFn(oldBoard, variables)

      // activeBoard 업데이트
      useBoardStore.setState({ activeBoard: newBoard })

      // 현재 보고 있는 카드 업데이트
      const { selectedCard } = useBoardStore.getState()
      if (selectedCard && selectedCard.id === variables.cardId) {
        // 변경된 보드 데이터에서 해당 카드를 찾아 교체 (가장 확실한 방법)
        const updatedList = newBoard.columns[variables.listId]
        const updatedCard = updatedList?.tasks.find(
          (t) => t.id === variables.cardId,
        )

        if (updatedCard) {
          useBoardStore.setState({ selectedCard: updatedCard })
        }
      }

      return newBoard
    })

    return { previousBoard }
  }

  // 공통 에러
  const handleError = (context, message) => {
    if (context?.previousBoard) {
      queryClient.setQueryData(queryKey, context.previousBoard)
      useBoardStore.setState({ activeBoard: context.previousBoard })
    }
    alert(message || '요청 처리에 실패했습니다.')
  }

  // 체크리스트 생성
  const createChecklistMutation = useMutation({
    mutationFn: ({ cardId, title }) => boardApi.createChecklist(cardId, title),
    onSuccess: (response, { cardId, listId, title }) => {
      const newItemId = response.data.data
      const newItem = { id: newItemId, cardId, title, done: false }

      // 생성은 ID가 필요하므로 onSuccess에서 처리
      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        targetList.tasks = targetList.tasks.map((task) => {
          if (task.id === cardId) {
            return {
              ...task,
              checklists: [...(task.checklists || []), newItem],
            }
          }
          return task
        })
        newColumns[listId] = targetList
        const newBoard = { ...oldBoard, columns: newColumns }

        // Zustand 동기화
        useBoardStore.setState({ activeBoard: newBoard })

        const { selectedCard } = useBoardStore.getState()
        if (selectedCard?.id === cardId) {
          useBoardStore.setState({
            selectedCard: {
              ...selectedCard,
              checklists: [...(selectedCard.checklists || []), newItem],
            },
          })
        }

        return newBoard
      })
    },
    onError: (error) => console.error('체크리스트 생성 실패:', error),
  })

  // 체크리스트 수정
  const updateChecklistMutation = useMutation({
    mutationFn: ({ itemId, updates }) =>
      boardApi.updateChecklist(itemId, updates),
    onMutate: (vars) =>
      handleOptimisticUpdate(
        (oldBoard, { cardId, listId, itemId, updates }) => {
          const newColumns = { ...oldBoard.columns }
          const targetList = { ...newColumns[listId] }

          targetList.tasks = targetList.tasks.map((task) => {
            if (task.id === cardId) {
              return {
                ...task,
                checklists: (task.checklists || []).map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item,
                ),
              }
            }
            return task
          })
          newColumns[listId] = targetList
          return { ...oldBoard, columns: newColumns }
        },
        vars,
      ),
    onError: (err, vars, ctx) => handleError(ctx, '체크리스트 수정 실패'),
  })

  // 체크리스트 삭제
  const deleteChecklistMutation = useMutation({
    mutationFn: ({ itemId }) => boardApi.deleteChecklist(itemId),
    onMutate: (vars) =>
      handleOptimisticUpdate((oldBoard, { cardId, listId, itemId }) => {
        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        targetList.tasks = targetList.tasks.map((task) => {
          if (task.id === cardId) {
            return {
              ...task,
              checklists: (task.checklists || []).filter(
                (item) => item.id !== itemId,
              ),
            }
          }
          return task
        })
        newColumns[listId] = targetList
        return { ...oldBoard, columns: newColumns }
      }, vars),
    onError: (err, vars, ctx) => handleError(ctx, '체크리스트 삭제 실패'),
  })

  return {
    createChecklist: createChecklistMutation.mutate,
    updateChecklist: updateChecklistMutation.mutate,
    deleteChecklist: deleteChecklistMutation.mutate,
  }
}
