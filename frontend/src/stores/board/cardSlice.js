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

    // 상태의 불변성 유지를 위해 깊은 복사
    const newColumns = { ...activeBoard.columns }

    // 출발/도착 리스트 복사
    const sourceList = { ...newColumns[fromListId] }
    const destList =
      fromListId === toListId ? sourceList : { ...newColumns[toListId] }

    // task 복사
    sourceList.tasks = [...sourceList.tasks]
    destList.tasks =
      fromListId === toListId ? sourceList.tasks : [...destList.tasks]

    // 카드 찾기 및 이동
    const cardIndex = sourceList.tasks.findIndex((t) => t.id === cardId)
    if (cardIndex === -1) return

    const [movedCard] = sourceList.tasks.splice(cardIndex, 1)

    // 이동된 카드의 정보 업데이트
    const updatedCard = { ...movedCard, listId: toListId }
    destList.tasks.splice(newIndex, 0, updatedCard)

    // 리스트 객체 다시 할당
    newColumns[fromListId] = sourceList
    newColumns[toListId] = destList

    // 상태 업데이트
    set({
      activeBoard: { ...activeBoard, columns: newColumns },
      selectedCard:
        selectedCard && selectedCard.id === cardId
          ? { ...selectedCard, listId: toListId }
          : selectedCard,
    })

    // 백엔드 API 호출
    try {
      await boardApi.moveCard(cardId, toListId, newIndex)
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

    // 상태 깊은 복사
    const newColumns = { ...activeBoard.columns }
    let newColumnOrder = [...activeBoard.columnOrder]

    // 현재 카드가 어느 리스트(진행 중/완료)에 있는지 찾기
    let currentListId = listId

    if (!newColumns[currentListId]?.tasks.find((t) => t.id === cardId)) {
      // 카드가 완료 리스트에 있는 경우
      if (newColumns[DONE_LIST_ID]?.tasks.find((t) => t.id === cardId)) {
        currentListId = DONE_LIST_ID
      }
    }

    // 수정하려는 카드가 존재하는 리스트
    const sourceList = { ...newColumns[currentListId] }
    const taskIndex = sourceList.tasks.findIndex((t) => t.id === cardId)

    if (taskIndex === -1) return // 카드가 없으면 종료

    // 업데이트
    if (updates.isComplete !== undefined) {
      // isComplete가 변경된 경우
      const isCompleting = updates.isComplete
      const card = { ...sourceList.tasks[taskIndex], ...updates }

      // 리스트 이동이 필요한 경우 (완료 <-> 미완료)
      if (isCompleting && currentListId !== DONE_LIST_ID) {
        // A) 미완료 -> 완료
        sourceList.tasks.splice(taskIndex, 1) // 원래 리스트에서 카드 제거
        newColumns[currentListId] = sourceList

        // 완료 리스트 생성 또는 가져오기
        if (!newColumns[DONE_LIST_ID]) {
          newColumns[DONE_LIST_ID] = {
            id: DONE_LIST_ID,
            title: '완료',
            tasks: [],
            isVirtual: true,
          }
          newColumnOrder.push(DONE_LIST_ID)
        }

        const doneList = { ...newColumns[DONE_LIST_ID] }
        doneList.tasks.push(card) // 완료 리스트에 카드 추가
        newColumns[DONE_LIST_ID] = doneList
      } else if (!isCompleting && currentListId === DONE_LIST_ID) {
        // B) 완료 -> 미완료 : 원래 리스트로 복귀
        sourceList.tasks.splice(taskIndex, 1) // 완료 리스트에서 제거
        newColumns[currentListId] = sourceList

        // 완료 리스트가 비어있으면 화면에서 숨김
        if (sourceList.tasks.length === 0) {
          delete newColumns[DONE_LIST_ID]
          newColumnOrder = newColumnOrder.filter((id) => id !== DONE_LIST_ID)
        }

        // 원래의 소속 리스트로 복귀
        const originListId = card.listId
        const originList = { ...newColumns[originListId] }
        originList.tasks.push(card)
      } else {
        // C) 이동 없음
        sourceList.tasks[taskIndex] = card
        newColumns[currentListId] = sourceList
      }
    } else {
      // isComplete 변경이 아닌 경우 : 카드 설정 변경
      sourceList.tasks[taskIndex] = {
        ...sourceList.tasks[taskIndex],
        ...updates,
      }
      newColumns[currentListId] = sourceList
    }

    // 상태 업데이트 (UI 즉시 반영)
    set({
      activeBoard: {
        ...activeBoard,
        columns: newColumns,
        columnOrder: newColumnOrder,
      },
      selectedCard:
        selectedCard?.id === cardId
          ? { ...selectedCard, ...updates }
          : selectedCard,
    })

    try {
      await boardApi.updateCard(cardId, updates)
    } catch (error) {
      console.error('카드 수정 실패:', error)
    }
  },
})
