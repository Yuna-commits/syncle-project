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

  // 1. 목적지가 완료 리스트인 경우 생성
  if (toListId === DONE_LIST_ID && !newColumns[DONE_LIST_ID]) {
    newColumns[DONE_LIST_ID] = {
      id: DONE_LIST_ID,
      title: '완료',
      order: 9999,
      tasks: [],
      isVirtual: true,
    }
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

  // 2. 원래 위치에서 카드 제거
  const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
  if (cardIndex === -1) return oldBoard

  const [movedCard] = sourceList.tasks.splice(cardIndex, 1)
  let updatedCard = { ...movedCard }

  // 3. 목적지에 따라 분기 처리 [수정된 부분]
  if (toListId === DONE_LIST_ID) {
    // [CASE A] 완료 리스트로 이동
    updatedCard.isComplete = true

    // 완료 리스트는 '최신순(ID 역순)'으로 보여주기로 했으므로,
    // 복잡한 order 계산 없이 단순히 배열에 추가만 합니다.
    destList.tasks.unshift(updatedCard)
  } else {
    // [CASE B] 일반 리스트로 이동 (또는 완료 -> 미완료 복귀)
    if (fromListId === DONE_LIST_ID) {
      updatedCard.isComplete = false
    }
    updatedCard.listId = toListId

    // --- 일반 리스트는 순서(Order) 계산 필요 ---

    // 1) 정확한 위치 파악을 위해 목적지 리스트를 order 기준으로 정렬
    const sortedDestTasks = [...destList.tasks].sort(
      (a, b) => a.order - b.order,
    )

    // 2) 이동되는 위치(newIndex)의 앞(prev), 뒤(next) 카드를 찾음
    const prevCard = sortedDestTasks[newIndex - 1]
    const nextCard = sortedDestTasks[newIndex]

    // 3) 중간값(order) 계산
    let newOrder
    if (!prevCard && !nextCard) {
      newOrder = 1000 // 빈 리스트
    } else if (!prevCard) {
      newOrder = nextCard.order / 2 // 맨 앞
    } else if (!nextCard) {
      newOrder = prevCard.order + 1000 // 맨 뒤
    } else {
      newOrder = (prevCard.order + nextCard.order) / 2 // 중간
    }

    // 4) 계산된 order 적용
    updatedCard.order = newOrder
    destList.tasks.splice(newIndex, 0, updatedCard)
  }

  // 상태 반영
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

  // 1. Source List 찾기
  let sourceListId = listId
  if (!newColumns[sourceListId]?.tasks.find((t) => t.id === cardId)) {
    if (newColumns[DONE_LIST_ID]?.tasks.find((t) => t.id === cardId)) {
      sourceListId = DONE_LIST_ID
    }
  }

  const sourceList = { ...newColumns[sourceListId] }
  if (!sourceList.tasks) return oldBoard
  sourceList.tasks = [...sourceList.tasks]

  const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
  if (cardIndex === -1) return oldBoard

  const oldCard = sourceList.tasks[cardIndex]
  const newCard = { ...oldCard, ...updates }

  // 아카이브 처리
  if (updates.isArchived === true) {
    sourceList.tasks.splice(cardIndex, 1)
    newColumns[sourceListId] = sourceList

    if (sourceListId === DONE_LIST_ID && sourceList.tasks.length === 0) {
      delete newColumns[DONE_LIST_ID]
      newColumnOrder = newColumnOrder.filter((id) => id !== DONE_LIST_ID)
    }

    return { ...oldBoard, columns: newColumns, columnOrder: newColumnOrder }
  }

  // 2. 업데이트 Target List 결정
  let targetListId = sourceListId
  if (updates.isComplete === true && sourceListId !== DONE_LIST_ID) {
    targetListId = DONE_LIST_ID
  } else if (updates.isComplete === false && sourceListId === DONE_LIST_ID) {
    targetListId = oldCard.listId
  }

  // 3. 리스트 처리
  if (sourceListId === targetListId) {
    // 제자리 업데이트
    sourceList.tasks[cardIndex] = newCard
    newColumns[sourceListId] = sourceList
  } else {
    // 리스트 이동
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

    // 가상 리스트 정리
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

      // 현재 선택된 카드가 수정된 경우 상태 업데이트
      const { selectedCard } = useBoardStore.getState()
      if (selectedCard && selectedCard.id === variables.cardId) {
        let updatedCard = { ...selectedCard }

        if (variables.updates) {
          updatedCard = { ...updatedCard, ...variables.updates }
        }
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
      const isSourceDone = fromListId === DONE_LIST_ID
      const isDestDone = toListId === DONE_LIST_ID

      // A) 미완료 -> 완료 이동
      if (isDestDone && !isSourceDone) {
        return boardApi.updateCard(cardId, { isComplete: true })
      }
      // B) 완료 -> 미완료 이동
      if (isSourceDone && !isDestDone) {
        await boardApi.updateCard(cardId, { isComplete: false })
        return boardApi.moveCard(cardId, toListId, newIndex)
      }
      // C) 완료 -> 완료 (이동 없음)
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
      const newCard = response.data.data
      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        const newColumns = { ...oldBoard.columns }
        if (!newColumns[listId]) return oldBoard

        const targetList = { ...newColumns[listId] }

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

        targetList.tasks = [...targetList.tasks, mappedCard]
        newColumns[listId] = targetList

        return { ...oldBoard, columns: newColumns }
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
