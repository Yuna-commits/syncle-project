import { boardApi } from '../../api/board.api'

const DONE_LIST_ID = 'virtual-done-list'

export const createCardSlice = (set, get) => ({
  selectedCard: null, // 현재 열린 카드 객체
  selectedCardColumnId: null, // 현재 열린 카드가 속한 리스트 ID
  isCardActionsOpen: false, // 카드 상세 내 액션 메뉴 드롭다운

  // 카드 상세 모달 열기
  openCardModal: (card, columnId) =>
    set({
      selectedCard: card,
      selectedCardColumnId: columnId,
      isCardActionsOpen: true,
    }),

  // 카드 상세 모달 닫기
  closeCardModal: () =>
    set({
      selectedCard: null,
      selectedCardColumnId: null,
      isCardActionsOpen: false,
    }),

  toggleCardActions: () =>
    set((state) => ({ isCardActionsOpen: !state.isCardActionsOpen })),

  // 카드 추가
  addCard: async (listId, title) => {
    const { activeBoard } = get()
    if (!activeBoard) return
    try {
      // 백엔드 API 호출
      const response = await boardApi.addCard(listId, title)

      const newCardId = response.data.data
      // 프론트엔드 상태 업데이트
      const updatedList = {
        ...activeBoard.columns[listId],
        tasks: [
          ...activeBoard.columns[listId].tasks,
          {
            id: newCardId,
            listId: listId,
            title: title,
            description: '',
            order: 0,
            dueDate: null,
            commentCount: 0,
            assignee: null,
            variant: 'solid',
          },
        ],
      }
      const updatedColumns = {
        ...activeBoard.columns,
        [listId]: updatedList,
      }

      set({ activeBoard: { ...activeBoard, columns: updatedColumns } })
    } catch (error) {
      console.error('카드 추가 실패:', error)
    }
  },

  // 카드 이동 (드래그 앤 드롭)
  moveCard: async (cardId, fromListId, toListId, newIndex) => {
    const { activeBoard, selectedCard } = get()
    if (!activeBoard) return

    // 1. 출발/도착 리스트 데이터 복사 및 준비
    const newColumns = { ...activeBoard.columns }
    const sourceList = { ...newColumns[fromListId] }
    // 같은 리스트 내 이동이면 sourceList 그대로 참조
    const destList =
      fromListId === toListId ? sourceList : { ...newColumns[toListId] }

    // task 복사
    sourceList.tasks = [...sourceList.tasks]
    destList.tasks =
      fromListId === toListId ? sourceList.tasks : [...destList.tasks]

    // 2. 카드 찾기 및 원래 위치에서 제거
    const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
    if (cardIndex === -1) return
    const [movedCard] = sourceList.tasks.splice(cardIndex, 1)

    // --- 3. 이동 시나리오별 속성 변경 및 API 동작 정의 ---
    const isSourceDone = fromListId === DONE_LIST_ID // 완료 -> 미완료
    const isDestDone = toListId === DONE_LIST_ID // 미완료 -> 완료

    let updatedCard = { ...movedCard }
    const apiActions = [] // 실행할 API 함수들을 담을 배열

    // A) 미완료 -> 완료 이동
    if (isDestDone && !isSourceDone) {
      updatedCard.isComplete = true
      apiActions.push(() => boardApi.updateCard(cardId, { isComplete: true }))
    }
    // B) 완료 -> 미완료 이동
    else if (isSourceDone && !isDestDone) {
      updatedCard.isComplete = false
      updatedCard.listId = toListId

      // 순서 보장
      apiActions.push(() => boardApi.updateCard(cardId, { isComplete: false }))
      apiActions.push(() => boardApi.moveCard(cardId, toListId, newIndex))
    }
    // C) 완료 -> 완료 (가상 리스트 내 순서 변경)
    else if (isSourceDone && isDestDone) {
      // API 호출 없음
    }
    // D) 미완료 -> 미완료 : 단순 이동
    else {
      updatedCard.listId = toListId
      apiActions.push(() => boardApi.moveCard(cardId, toListId, newIndex))
    }

    // 4. 변경된 카드를 새 위치에 삽입
    destList.tasks.splice(newIndex, 0, updatedCard)

    // 5. 상태 업데이트 (UI 즉시 반영)
    newColumns[fromListId] = sourceList
    newColumns[toListId] = destList

    set({
      activeBoard: { ...activeBoard, columns: newColumns },
      selectedCard: selectedCard?.id === cardId ? updatedCard : selectedCard,
    })

    // 백엔드 API 호출
    try {
      for (const action of apiActions) {
        await action()
      }
    } catch (error) {
      console.error('카드 이동 실패:', error)
      alert('카드 이동에 실패했습니다.')
      get().fetchBoard(activeBoard.id) // 보드 데이터 재로딩
    }
    console.log('이동 성공')
  },

  // 1. 카드 수정 (설명, 담당자, 완료 처리 등)
  updateCard: async (cardId, listId, updates) => {
    const { activeBoard, selectedCard } = get()
    if (!activeBoard) return

    // 1. 데이터 복사
    const newColumns = { ...activeBoard.columns }
    let newColumnOrder = [...activeBoard.columnOrder]

    // 2. 현재 카드의 위치 찾기 (Source List 결정)
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

    const taskIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
    if (taskIndex === -1) return // 카드가 없으면 종료

    // 3. 업데이트 및 목적지(Target List) 결정
    const oldCard = sourceList.tasks[taskIndex]
    const newCard = { ...oldCard, ...updates }

    let targetListId = sourceListId // 기본은 제자리 업데이트

    // 완료 상태 변경이 감지되면 목적지 변경
    if (updates.isComplete === true && sourceListId != DONE_LIST_ID) {
      targetListId = DONE_LIST_ID // 미완료 -> 완료
    } else if (updates.isComplete === false && sourceListId === DONE_LIST_ID) {
      targetListId = oldCard.listId // 완료 -> 미완료 (원래 리스트로 복귀)
    }

    // 4. 리스트 처리
    if (sourceListId === targetListId) {
      // A) 제자리 업데이트 (단순 속성 변경)
      sourceList.tasks[taskIndex] = newCard
      newColumns[sourceListId] = sourceList
    } else {
      // B) 리스트 이동 (가상 리스트 진입/이탈)

      // 1) Source에서 제거
      sourceList.tasks.splice(taskIndex, 1)
      newColumns[sourceListId] = sourceList

      // 2) Target 준비 (가상 리스트 생성)
      if (targetListId === DONE_LIST_ID && !newColumns[DONE_LIST_ID]) {
        newColumns[DONE_LIST_ID] = {
          id: DONE_LIST_ID,
          title: '완료',
          tasks: [],
          isVirtual: true,
        }
        newColumnOrder.push(DONE_LIST_ID)
      }

      // 3) Target에 추가
      const targetList = { ...newColumns[targetListId] }
      targetList.tasks = [...targetList.tasks]
      targetList.tasks.push(newCard) // 맨 뒤에 추가
      newColumns[targetListId] = targetList

      // 4) 가상 리스트 정리 (비어있으면 삭제)
      if (sourceListId === DONE_LIST_ID && sourceList.tasks.length === 0) {
        delete newColumns[DONE_LIST_ID]
        newColumnOrder = newColumnOrder.filter((id) => id !== DONE_LIST_ID)
      }
    }

    // 5. 상태 업데이트 (UI 즉시 반영)
    set({
      activeBoard: {
        ...activeBoard,
        columns: newColumns,
        columnOrder: newColumnOrder,
      },
      selectedCard: selectedCard?.id === cardId ? newCard : selectedCard,
    })

    // 6. API 호출
    try {
      await boardApi.updateCard(cardId, updates)
    } catch (error) {
      console.error('카드 수정 실패:', error)
    }
  },
})
