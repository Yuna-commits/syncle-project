import { boardApi } from '../../api/board.api'

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
    const { activeBoard } = get()
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
    set({ activeBoard: { ...activeBoard, columns: newColumns } })

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

  // 1. 카드 수정 (설명 등)
  updateCard: async (cardId, listId, updates) => {
    const { activeBoard, selectedCard } = get()
    if (!activeBoard) return

    // 낙관적 업데이트
    const newColumns = { ...activeBoard.columns }
    const column = { ...newColumns[listId] }

    column.tasks = column.tasks.map((task) =>
      task.id === cardId ? { ...task, ...updates } : task,
    )
    newColumns[listId] = column

    set({
      activeBoard: { ...activeBoard, columns: newColumns },
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
