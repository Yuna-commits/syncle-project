import { create } from 'zustand'
import { boardApi } from '../api/board.api'

const useBoardStore = create((set, get) => ({
  // 현재 보고 있는 보드의 상세 데이터
  activeBoard: null,

  isLoading: false,
  error: null,

  // UI 모달, 패널 상태
  selectedCard: null, // 현재 열린 카드 객체
  selectedCardColumnId: null, // 현재 열린 카드가 속한 리스트 ID
  isSettingsOpen: false, // 우측 설정 사이드바
  isShareOpen: false, // 공유 모달
  isCardActionsOpen: false, // 카드 상세 내 액션 메뉴 드롭다운

  /**
   * === UI 제어 ===
   */

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

  // 설정 사이드바 토글
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  // 보드 공유 모달 토글
  toggleShare: () => set((state) => ({ isShareOpen: !state.isShareOpen })),

  toggleCardActions: () =>
    set((state) => ({ isCardActionsOpen: !state.isCardActionsOpen })),

  /**
   * === API 액션 ===
   */

  // 즐겨찾기 토글
  toggleFavorite: async () => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 낙관적 업데이트 : API 응답 기다리지 않고 UI 먼저 변경
    const previousState = activeBoard.isFavorite
    set({
      activeBoard: { ...activeBoard, isFavorite: !previousState },
    })

    try {
      // API 호출 /boards/{boardId}/favorite
      await boardApi.toggleFavorite(activeBoard.id)
    } catch (error) {
      // 실패 시 롤백
      set({ activeBoard: { ...activeBoard, isFavorite: previousState } })
      if (error.response?.data?.errorCode === 'FAVORITE_LIMIT_EXCEEDED') {
        alert('즐겨찾기는 최대 4개까지만 가능합니다.')
      }
    }
  },

  // 보드 상세 정보 가져오기
  fetchBoard: async (boardId, navigate, showLoading = true) => {
    set({ error: null })
    try {
      if (showLoading) {
        set({ isLoading: true })
      }
      // 1. 백엔드에서 보드 뷰(보드+멤버+리스트+카드) 데이터 조회
      // GET /api/boards/{boardId}/view
      const response = await boardApi.fetchBoard(boardId)
      const serverData = response.data.data

      console.log('응답: ', response)

      // 백엔드 데이터를 프론트엔드 구조로 변환
      const formattedData = normalizeBoardData(serverData)

      console.log('보드 데이터: ', formattedData)

      // 3. 상태 업데이트
      set({ activeBoard: formattedData })
    } catch (error) {
      if (error.response.status === 403) {
        alert('해당 보드에 접근할 권한이 없습니다')
        navigate('/dashboard') // 메인화면으로 강제 이동
      }
      console.error('보드 로드 실패:', error)
      set({ error: '보드 정보를 불러오지 못했습니다.' })
    } finally {
      set({ isLoading: false })
    }
  },

  // 보드 정보 수정 (이름, 설명, 공개범위)
  updateBoard: async (boardId, updateData) => {
    if (!updateData) {
      return
    }
    // UI 먼저 변경사항 반영
    const prevBoard = get().activeBoard
    set({ activeBoard: { ...prevBoard, ...updateData } })

    try {
      await boardApi.updateBoard(boardId, updateData)
    } catch (error) {
      console.error('보드 수정 실패:', error)
      set({ activeBoard: prevBoard }) // 롤백
      alert('보드 정보 수정에 실패했습니다.')
    }
  },

  // 보드 삭제
  deleteBoard: async (boardId) => {
    const teamId = get().teamId
    try {
      await boardApi.deleteBoard(boardId)
      window.location.href = `/teams/${teamId}/boards` // 삭제 후 이동
    } catch (error) {
      console.error('보드 삭제 실패:', error)
      alert('보드 삭제에 실패했습니다.')
    }
  },

  // 보드 권한 수정
  updatePermissions: async () => {},

  // 보드 멤버 역할 변경
  changeMemberRole: async (boardId, userId, newRole) => {
    const { activeBoard } = get()
    // UI 먼저 변경사항 반영 - 실패 시 롤백
    const updateMembers = activeBoard.members.map((m) =>
      m.id === userId ? { ...m, role: newRole } : m,
    )
    set({ activeBoard: { ...activeBoard, members: updateMembers } })

    try {
      await boardApi.changeMemberRole(boardId, userId, newRole)
    } catch (error) {
      console.error('권한 변경 실패:', error)
      // 롤백 (원래대로)
      await get().fetchBoard(boardId)
      alert('권한 변경에 실패했습니다.')
    }
  },

  // 보드 멤버 탈퇴
  removeMember: async (boardId, userId) => {
    const { activeBoard } = get()
    // UI 먼저 변경사항 반영
    const filteredMembers = activeBoard.members.filter((m) => m.id !== userId)
    set({ activeBoard: { ...activeBoard, members: filteredMembers } })

    try {
      await boardApi.removeMember(boardId, userId)
    } catch (error) {
      console.error('멤버 추방 실패:', error)
      await get().fetchBoard(boardId)
      alert('멤버 추방에 실패했습니다.')
    }
  },

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
      const updatedColumnOrder = [...activeBoard.columnOrder, newList.id]

      // 3. 상태 일괄 적용
      set({
        activeBoard: {
          ...activeBoard,
          columns: updatedColumns,
          columnOrder: updatedColumnOrder,
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

  // 2. 체크리스트 아이템 생성
  // 백엔드 API: POST /api/cards/{cardId}/checklists (Body: { title })
  createChecklist: async (cardId, listId, title) => {
    const { activeBoard, selectedCard } = get()

    try {
      const response = await boardApi.createChecklist(cardId, title)
      const newItemId = response.data.data

      // 새 아이템 객체 (백엔드 ChecklistVo 구조에 맞춤)
      const newItem = {
        id: newItemId,
        cardId,
        title,
        done: false,
      }

      // 상태 업데이트
      const newColumns = { ...activeBoard.columns }
      const column = { ...newColumns[listId] }

      column.tasks = column.tasks.map((task) => {
        if (task.id === cardId) {
          return {
            ...task,
            checklists: [...(task.checklists || []), newItem],
          }
        }
        return task
      })
      newColumns[listId] = column

      set({
        activeBoard: { ...activeBoard, columns: newColumns },
        selectedCard: {
          ...selectedCard,
          checklists: [...(selectedCard.checklists || []), newItem],
        },
      })
    } catch (error) {
      console.error('체크리스트 아이템 생성 실패:', error)
    }
  },

  // 3. 체크리스트 아이템 수정 (완료 여부, 내용)
  // 백엔드 API: PATCH /api/checklists/{checklistId}
  updateChecklist: async (cardId, listId, itemId, updates) => {
    const { activeBoard, selectedCard } = get()

    // 낙관적 업데이트
    const newColumns = { ...activeBoard.columns }
    const column = { ...newColumns[listId] }

    column.tasks = column.tasks.map((task) => {
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
    newColumns[listId] = column

    set({
      activeBoard: { ...activeBoard, columns: newColumns },
      selectedCard: {
        ...selectedCard,
        checklists: (selectedCard.checklists || []).map((item) =>
          item.id === itemId ? { ...item, ...updates } : item,
        ),
      },
    })

    try {
      await boardApi.updateChecklist(itemId, updates)
    } catch (error) {
      console.error('체크리스트 아이템 수정 실패:', error)
    }
  },

  // 4. 체크리스트 아이템 삭제
  // 백엔드 API: DELETE /api/checklists/{checklistId}
  deleteChecklist: async (cardId, listId, itemId) => {
    const { activeBoard, selectedCard } = get()

    // 낙관적 업데이트
    const newColumns = { ...activeBoard.columns }
    const column = { ...newColumns[listId] }

    column.tasks = column.tasks.map((task) => {
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
    newColumns[listId] = column

    set({
      activeBoard: { ...activeBoard, columns: newColumns },
      selectedCard: {
        ...selectedCard,
        checklists: (selectedCard.checklists || []).filter(
          (item) => item.id !== itemId,
        ),
      },
    })

    try {
      await boardApi.deleteChecklist(itemId)
    } catch (error) {
      console.error('체크리스트 아이템 삭제 실패:', error)
    }
  },

  // 보드 데이터 초기화 (페이지 나갈 때 사용)
  resetBoard: () => set({ activeBoard: null, error: null }),
}))

// 2. 데이터 변환 (Server Array -> Client Object Map)
// 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
const normalizeBoardData = (dto) => {
  if (!dto) {
    return null
  }

  const columns = {}

  const serverLists = dto.lists || []

  serverLists.forEach((list) => {
    columns[list.id] = {
      id: list.id,
      title: list.title,
      order: list.orderIndex,

      // 카드 매핑 (CardResponse -> UI Card Object)
      tasks: (list.cards || []).map((card) => ({
        id: card.id,
        listId: list.id, // 부모 리스트 ID 역참조 용
        title: card.title,
        description: card.description,
        order: card.orderIndex,
        dueDate: card.dueDate,
        // 댓글 수
        commentCount: card.commentCount || 0,

        // 백엔드에서 넘어온 ChecklistVo 리스트를 바로 매핑
        checklists: (card.checklists || []).map((cl) => ({
          id: cl.id,
          title: cl.title,
          done: cl.done,
        })),

        // 담당자 객체 (Assignee)
        assignee: card.assigneeId
          ? {
              id: card.assigneeId,
              name: card.assigneeName,
              profileImg: card.assigneeProfileImg,
            }
          : null,

        // 프론트 UI 전용 속성 (필요시)
        variant: 'solid',
      })),
    }
  })

  // 2. 멤버 매핑 (MemberResponse -> UI Member Object)
  const mapMember = (m) => ({
    id: m.userId, // ★ 중요: 백엔드(userId) -> 프론트(id)로 매핑
    name: m.nickname,
    email: m.email,
    profileImg: m.profileImg,
    role: m.role, // "OWNER", "MEMBER" 등 Enum String
    position: m.position,
  })

  // 3. 최종 보드 객체 반환
  return {
    id: dto.id,
    title: dto.title,
    isFavorite: dto.isFavorite,
    description: dto.description,
    visibility: dto.visibility, // "PUBLIC" or "TEAM"
    ownerId: dto.ownerId,

    // 팀 네비게이션 정보
    teamId: dto.teamId,
    teamName: dto.teamName,

    // 멤버 리스트 변환
    members: (dto.boardMembers || []).map(mapMember), // 보드 헤더 표시용
    teamMembers: (dto.teamMembers || []).map(mapMember), // 초대 모달 등 사용

    columns: columns, // 변환된 컬럼 객체
    columnOrder: serverLists.map((l) => l.id), // 리스트 순서 배열 (필요시 사용)
  }
}

export default useBoardStore
