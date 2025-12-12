import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'
import useBoardStore from '../../stores/useBoardStore'

const DONE_LIST_ID = 'virtual-done-list'

// -- 카드 이동 시 낙관적 업데이트 로직 --
const moveCardOptimisticUpdate = (
  oldBoard,
  { cardId, fromListId, toListId, newIndex },
) => {
  if (!oldBoard) return oldBoard
  const newColumns = { ...oldBoard.columns }
  const sourceList = { ...newColumns[fromListId] }

  // 목적지가 완료 리스트인 경우 생성
  if (toListId === DONE_LIST_ID && !newColumns[DONE_LIST_ID]) {
    newColumns[DONE_LIST_ID] = {
      id: DONE_LIST_ID,
      title: '완료',
      order: 9999,
      tasks: [],
      isVirtual: true,
    }
    // columnOrder에도 추가
    if (!oldBoard.columnOrder.includes(DONE_LIST_ID)) {
      oldBoard.columnOrder = [...oldBoard.columnOrder, DONE_LIST_ID]
    }
  }

  const destList =
    fromListId === toListId ? sourceList : { ...newColumns[toListId] }

  // 배열 복사 (불변성 유지)
  sourceList.tasks = [...sourceList.tasks]
  destList.tasks =
    fromListId === toListId ? sourceList.tasks : [...destList.tasks]

  // 카드 이동 처리
  const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
  if (cardIndex === -1) return oldBoard

  const [movedCard] = sourceList.tasks.splice(cardIndex, 1)

  // -- 이동 시나리오별 속성 업데이트 --
  let updatedCard = { ...movedCard }
  if (toListId === DONE_LIST_ID) {
    // 미완료 -> 완료
    updatedCard.isComplete = true
  } else if (fromListId === DONE_LIST_ID) {
    // 완료 -> 미완료
    updatedCard.isComplete = false
    updatedCard.listId = toListId
  } else {
    // 일반 이동
    updatedCard.listId = toListId
  }

  destList.tasks.splice(newIndex, 0, updatedCard)

  newColumns[fromListId] = sourceList
  newColumns[toListId] = destList

  // 가상 리스트가 비었으면 삭제
  if (fromListId === DONE_LIST_ID && sourceList.tasks.length === 0) {
    delete newColumns[DONE_LIST_ID]
    oldBoard.columnOrder = oldBoard.columnOrder.filter(
      (id) => id !== DONE_LIST_ID,
    )
  }

  return { ...oldBoard, columns: newColumns }
}

// -- 카드 수정 시 낙관적 업데이트 로직 --
const updateCardOptimisticUpdate = (oldBoard, { cardId, listId, updates }) => {
  if (!oldBoard) return oldBoard

  const newColumns = { ...oldBoard.columns }
  let newColumnOrder = [...oldBoard.columnOrder]

  // 1. Source List 찾기 (listId 파라미터 신뢰 + 가상 리스트 확인)
  let sourceListId = listId
  if (!newColumns[sourceListId]?.tasks.find((t) => t.id === cardId)) {
    // 카드가 완료 리스트에 있는 경우
    if (newColumns[DONE_LIST_ID]?.tasks.find((t) => t.id === cardId)) {
      sourceListId = DONE_LIST_ID
    }
  }

  // 수정하려는 카드가 존재하는 리스트
  const sourceList = { ...newColumns[sourceListId] }
  sourceList.tasks = [...sourceList.tasks]

  const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
  if (cardIndex === -1) return oldBoard

  const oldCard = sourceList.tasks[cardIndex]
  const newCard = { ...oldCard, ...updates }

  // 2. 업데이트 Target List 결정
  let targetListId = sourceListId
  if (updates.isComplete === true && sourceListId !== DONE_LIST_ID) {
    targetListId = DONE_LIST_ID
  } else if (updates.isComplete === false && sourceListId === DONE_LIST_ID) {
    targetListId = oldCard.listId // 원래 리스트로 복귀
  }

  // 3. 리스트 처리
  if (sourceListId === targetListId) {
    // 제자리 업데이트인 경우
    sourceList.tasks[cardIndex] = newCard
    newColumns[sourceListId] = sourceList
  } else {
    // 리스트 이동 발생한 경우
    sourceList.tasks.splice(cardIndex, 1)
    newColumns[sourceListId] = sourceList

    // Target 준비
    if (targetListId === DONE_LIST_ID && !newColumns[DONE_LIST_ID]) {
      newColumns[DONE_LIST_ID] = {
        id: DONE_LIST_ID,
        title: '완료',
        order: 9999,
        tasks: [],
        isVirtual: true,
      }
      newColumnOrder.push(DONE_LIST_ID)
    }

    // Target에 추가
    const targetList = { ...newColumns[targetListId] }
    targetList.tasks = [...(targetList.tasks || [])]
    targetList.tasks.push(newCard)
    newColumns[targetListId] = targetList

    // 가상 리스트 청소 (비어있으면 삭제)
    if (sourceListId === DONE_LIST_ID && sourceList.tasks.length === 0) {
      delete newColumns[DONE_LIST_ID]
      newColumnOrder = newColumnOrder.filter((id) => id !== DONE_LIST_ID)
    }
  }

  return { ...oldBoard, columns: newColumns, columnOrder: newColumnOrder }
}

// -- Main Hook --
export const useCardMutations = (boardId) => {
  const queryClient = useQueryClient()
  const queryKey = ['board', Number(boardId)]

  // 공통 onMutate 처리
  const handleOptimisticUpdate = async (updateFn, variables) => {
    await queryClient.cancelQueries({ queryKey })

    const previousBoard = queryClient.getQueryData(queryKey)

    // 1. React Query 캐시 업데이트
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old
      const newBoard = updateFn(old, variables)

      // 2. Zustand 스토어 동기화 (모달용)
      useBoardStore.setState({ activeBoard: newBoard })

      // 현재 선택된 카드가 수정된 경우, selectedCard 상태도 업데이트
      const { selectedCard } = useBoardStore.getState()
      if (selectedCard && selectedCard.id === variables.cardId) {
        // 업데이트된 보드에서 해당 카드를 찾는 로직 대신, 간편하게 updates 병합
        // (주의: 리스트 이동 등의 복잡한 변경은 activeBoard가 처리하므로 여기선 속성만 반영)
        let updatedCard = { ...selectedCard }

        if (variables.updates) {
          updatedCard = { ...updatedCard, ...variables.updates }
        }
        // moveCard의 경우
        if (variables.toListId) {
          updatedCard.listId = variables.toListId
        }

        useBoardStore.setState({ selectedCard: updatedCard })
      }

      return newBoard
    })

    return { previousBoard }
  }

  // 공통 onError 처리
  const handleError = (context, message) => {
    if (context?.previousBoard) {
      queryClient.setQueryData(queryKey, context.previousBoard)
    }
    alert(message || '작업에 실패했습니다.')
  }

  // 카드 이동
  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, fromListId, toListId, newIndex }) => {
      const isSourceDone = fromListId === DONE_LIST_ID // 완료 -> 미완료
      const isDestDone = toListId === DONE_LIST_ID // 미완료 -> 완료

      // A) 미완료 -> 완료 이동
      if (isDestDone && !isSourceDone) {
        return boardApi.updateCard(cardId, { isComplete: true })
      }
      // B) 완료 -> 미완료 이동
      if (isSourceDone && !isDestDone) {
        await boardApi.updateCard(cardId, { isComplete: false })
        return boardApi.moveCard(cardId, toListId, newIndex)
      }
      // C) 완료 -> 완료 (가상 리스트 내 순서 변경)
      if (isSourceDone && isDestDone) {
        return Promise.resolve()
      }
      // D) 미완료 -> 미완료 : 단순 이동
      return boardApi.moveCard(cardId, toListId, newIndex)
    },

    onMutate: (vars) => handleOptimisticUpdate(moveCardOptimisticUpdate, vars),
    onError: (err, vars, ctx) => handleError(ctx, '카드 이동 실패'),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 카드 생성
  const addCardMutation = useMutation({
    mutationFn: ({ listId, title }) => boardApi.addCard(listId, title),
    onSuccess: (response, { listId }) => {
      // 서버에서 생성된 카드 데이터
      const newCard = response.data.data

      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        const newColumns = { ...oldBoard.columns }
        // 리스트가 없을 경우 방어 코드
        if (!newColumns[listId]) return oldBoard

        const targetList = { ...newColumns[listId] }

        // 서버 응답(CardResponse) -> 클라이언트 객체 매핑
        const mappedCard = {
          id: newCard.id,
          listId: listId,
          title: newCard.title,
          description: newCard.description,
          order: newCard.orderIndex,
          dueDate: newCard.dueDate,
          isComplete: false,
          commentCount: 0,
          checklists: [],
          assignee: newCard.assigneeId
            ? {
                id: newCard.assigneeId,
                name: newCard.assigneeName,
                profileImg: newCard.assigneeProfileImg,
              }
            : null,
          variant: 'solid',
        }

        // 해당 리스트의 tasks 배열 끝에 추가
        targetList.tasks = [...targetList.tasks, mappedCard]
        newColumns[listId] = targetList

        return {
          ...oldBoard,
          columns: newColumns,
        }
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 카드 수정
  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, updates }) => boardApi.updateCard(cardId, updates),
    onMutate: (vars) =>
      handleOptimisticUpdate(updateCardOptimisticUpdate, vars),
    onError: (err, vars, ctx) => handleError(ctx, '카드 수정 실패'),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 카드 삭제
  const deleteCardMutation = useMutation({
    mutationFn: ({ cardId }) => boardApi.deleteCard(cardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err, vars, ctx) => handleError(ctx, '카드 삭제 실패'),
  })

  return {
    moveCard: moveCardMutation.mutate,
    addCard: addCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
  }
}
