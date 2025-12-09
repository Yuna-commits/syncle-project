import { boardApi } from '../../api/board.api'

const DONE_LIST_ID = 'virtual-done-list'

export const createListSlice = (set, get) => ({
  // 리스트 추가
  addList: async (title) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    try {
      // 백엔드 api 호출
      const response = await boardApi.addList(activeBoard.id, title)

      const newList = response.data.data
      // 프론트엔드 상태 업데이트
      const updatedColumns = {
        ...activeBoard.columns,
        [newList.id]: {
          id: newList.id,
          title: newList.title,
          order: newList.orderIndex,
          tasks: [],
        },
      }

      const newColumnOrder = [...activeBoard.columnOrder]
      // 완료 리스트가 존재하는지 확인
      const doneListIndex = newColumnOrder.indexOf(DONE_LIST_ID)

      if (doneListIndex !== -1) {
        // 완료 리스트가 있는 경우 -> 완료 리스트 앞에 새 리스트 추가
        newColumnOrder.splice(doneListIndex, 0, newList.id)
      } else {
        // 완료 리스트가 없는 경우 -> 맨 뒤에 새 리스트 추가
        newColumnOrder.push(newList.id)
      }

      // 3. 상태 일괄 적용
      set({
        activeBoard: {
          ...activeBoard,
          columns: updatedColumns,
          columnOrder: newColumnOrder,
        },
      })
    } catch (error) {
      console.error('리스트 추가 실패:', error)
    }
  },

  // 리스트 제목 수정
  updateList: async (listId, newTitle) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 1. 프론트엔드 선 반영 (Optimistic Update)
    const oldColumns = { ...activeBoard.columns }
    const updatedColumns = {
      ...oldColumns,
      [listId]: {
        ...oldColumns[listId],
        title: newTitle,
      },
    }

    set({ activeBoard: { ...activeBoard, columns: updatedColumns } })

    try {
      // 2. 백엔드 API 호출
      await boardApi.updateList(listId, newTitle)
    } catch (error) {
      console.error('리스트 수정 실패:', error)
      // 실패 시 롤백
      set({ activeBoard: { ...activeBoard, columns: oldColumns } })
      alert('리스트 이름 수정에 실패했습니다.')
    }
  },

  // 리스트 삭제
  deleteList: async (listId) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 1. 사용자에게 확인 (선택 사항, 바로 삭제하려면 제거 가능)
    if (
      !window.confirm(
        '정말 이 리스트를 삭제하시겠습니까? 포함된 카드는 모두 삭제됩니다.',
      )
    ) {
      return
    }

    try {
      // 2. 백엔드 API 호출
      await boardApi.deleteList(listId)

      // 3. 프론트엔드 상태 업데이트
      const newColumns = { ...activeBoard.columns }
      delete newColumns[listId] // 객체에서 해당 리스트 ID 키를 삭제

      // 순서 배열(columnOrder)에서도 해당 ID 제거
      const newColumnOrder = activeBoard.columnOrder.filter(
        (id) => id !== listId,
      )

      set({
        activeBoard: {
          ...activeBoard,
          columns: newColumns,
          columnOrder: newColumnOrder,
        },
      })
    } catch (error) {
      console.error('리스트 삭제 실패:', error)
      alert('리스트 삭제 중 오류가 발생했습니다.')
    }
  },

  // 리스트 이동(드래그 앤 드롭)
  moveList: async (oldIndex, newIndex) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 낙관적 업데이트 (Optimistic Update)
    const newColumnOrder = [...activeBoard.columnOrder]
    const [movedListId] = newColumnOrder.splice(oldIndex, 1)
    newColumnOrder.splice(newIndex, 0, movedListId)

    set({
      activeBoard: {
        ...activeBoard,
        columnOrder: newColumnOrder,
      },
    })

    // 백엔드 api 호출
    try {
      const payload = newColumnOrder.map((id, index) => ({
        listId: id,
        orderIndex: index,
      }))
      await boardApi.moveList(activeBoard.id, payload)
    } catch (error) {
      console.error('리스트 이동 실패:', error)
      // 실패 시 롤백
      get().fetchBoard(activeBoard.id)
    }
  },
})
