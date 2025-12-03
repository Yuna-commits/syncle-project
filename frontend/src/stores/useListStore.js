import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useListStore = create((set, get) => ({
  // ===========================================================
  // 1. State (초기값은 비워둠)
  // ===========================================================
  boards: {}, // { [boardId]: { id, name, columns: {...}, ... } }
  activeBoardId: null,

  // UI 토글 상태
  isSettingsOpen: false,
  isShareOpen: false,

  // ===========================================================
  // 2. Actions
  // ===========================================================

  // --- UI 제어 ---
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  toggleShare: () => set((state) => ({ isShareOpen: !state.isShareOpen })),

  // --- 보드 데이터 불러오기 (API 연동 핵심) ---
  fetchBoard: async (boardId) => {
    try {
      // 1. 백엔드에서 보드 뷰(리스트+카드 포함) 데이터 조회
      // GET /api/boards/{boardId}/view
      const response = await api.get(`/boards/${boardId}/view`)
      const serverData = response.data.data

      // 2. 데이터 변환 (Server Array -> Client Object Map)
      // 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
      const columns = {}

      if (serverData.lists) {
        serverData.lists.forEach((list) => {
          columns[list.id] = {
            id: list.id,
            title: list.title,
            subtitle: `${list.cards ? list.cards.length : 0} tasks`,
            badgeClass: 'bg-gray-100 text-gray-700', // 기본 스타일
            // 카드 리스트 매핑
            tasks: list.cards
              ? list.cards.map((card) => ({
                  id: card.id,
                  title: card.title,
                  description: card.description,
                  variant: 'solid', // 기본 스타일
                  // 추후 태그, 담당자 등 필드 추가 시 여기에 매핑
                }))
              : [],
          }
        })
      }

      // 3. 상태 업데이트
      set((state) => ({
        activeBoardId: boardId,
        boards: {
          ...state.boards,
          [boardId]: {
            id: boardId,
            name: serverData.title,
            description: serverData.description,
            visibility: serverData.visibility,
            columns: columns, // 변환된 컬럼 데이터 주입
            members: [], // TODO: 멤버 목록 API 연동 필요
            archive: { cards: [] }, // 아카이브 데이터는 별도 API가 필요할 수 있음
          },
        },
      }))
    } catch (error) {
      console.error('보드 데이터 로딩 실패:', error)
    }
  },

  // 보드 정보 수정 (Optimistic Update)
  updateBoardInfo: (key, value) => {
    const { boards, activeBoardId } = get()
    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...boards[activeBoardId], [key]: value },
      },
    })
    // TODO: API 호출 (PATCH /api/boards/{id})
  },

  // --- 리스트(Column) 관리 ---
  addList: (title) => {
    const { activeBoardId, boards } = get()

    // 임시 ID 생성 (API 연동 시 서버 응답 ID로 교체 필요)
    const newId = `list-temp-${Date.now()}`

    const board = boards[activeBoardId]
    const newColumns = {
      ...board.columns,
      [newId]: {
        id: newId,
        title,
        subtitle: '0 tasks',
        badgeClass: 'bg-gray-100 text-gray-700',
        tasks: [],
      },
    }

    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    })

    // TODO: API 호출 -> 성공 시 temp ID를 실제 ID로 교체하는 로직 추가 필요
    // await api.post(...)
  },

  deleteList: (columnId) => {
    const { activeBoardId, boards } = get()
    const board = boards[activeBoardId]
    const newColumns = { ...board.columns }
    delete newColumns[columnId]

    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    })
    // TODO: API 호출 (DELETE /api/lists/{id})
  },

  // --- 카드(Task) 관리 ---
  addCard: (columnId, title) => {
    const { activeBoardId, boards } = get()

    const newId = `card-temp-${Date.now()}`

    const newTask = {
      id: newId,
      title,
      description: '',
      variant: 'solid',
      tag: '',
    }

    const board = boards[activeBoardId]
    const column = board.columns[columnId]
    const newColumns = {
      ...board.columns,
      [columnId]: { ...column, tasks: [...column.tasks, newTask] },
    }

    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    })

    // TODO: API 호출 (POST /api/lists/{listId}/cards)
  },

  // 카드 내용 수정 (상세 모달 등에서 호출)
  updateCard: (columnId, cardId, updates) => {
    const { boards, activeBoardId } = get()
    const board = boards[activeBoardId]
    const column = board.columns[columnId]

    if (!column) return

    const tasks = column.tasks.map((t) =>
      t.id === cardId ? { ...t, ...updates } : t,
    )

    const newColumns = {
      ...board.columns,
      [columnId]: { ...column, tasks },
    }

    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    })
    // TODO: API 호출
  },

  // 드래그 앤 드롭 이동
  moveCard: (fromColId, toColId, oldIndex, newIndex) => {
    const { activeBoardId, boards } = get()
    const board = boards[activeBoardId]
    const newColumns = { ...board.columns }

    const fromCol = { ...newColumns[fromColId] }
    const toCol = fromColId === toColId ? fromCol : { ...newColumns[toColId] }

    const fromTasks = [...fromCol.tasks]
    const toTasks = fromColId === toColId ? fromTasks : [...toCol.tasks]

    // 이동 로직
    const [movedTask] = fromTasks.splice(oldIndex, 1)
    toTasks.splice(newIndex, 0, movedTask)

    fromCol.tasks = fromTasks
    toCol.tasks = toTasks
    newColumns[fromColId] = fromCol
    newColumns[toColId] = toCol

    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    })
    // TODO: API 호출 (PATCH /api/cards/move 등 - 순서 변경 로직)
  },

  // --- 아카이브 및 멤버 관리 (UI 로직만 유지) ---
  archiveCard: (columnId, cardId) => {
    const { boards, activeBoardId } = get()
    const board = boards[activeBoardId]
    const column = { ...board.columns[columnId] }
    const taskIndex = column.tasks.findIndex((t) => t.id === cardId)
    if (taskIndex === -1) return

    const [task] = column.tasks.splice(taskIndex, 1)
    const archivedCard = {
      ...task,
      originalColumnId: columnId,
      originalColumnTitle: column.title,
      archivedAt: new Date().toISOString(),
    }

    set({
      boards: {
        ...boards,
        [activeBoardId]: {
          ...board,
          columns: { ...board.columns, [columnId]: column },
          archive: {
            ...board.archive,
            cards: [...board.archive.cards, archivedCard],
          },
        },
      },
    })
    // TODO: API 호출 (상태값 변경)
  },

  restoreCard: (cardId) => {
    const { boards, activeBoardId } = get()
    const board = boards[activeBoardId]
    const archive = { ...board.archive }
    const cardIndex = archive.cards.findIndex((c) => c.id === cardId)
    if (cardIndex === -1) return

    const [card] = archive.cards.splice(cardIndex, 1)
    const targetColId =
      card.originalColumnId && board.columns[card.originalColumnId]
        ? card.originalColumnId
        : Object.keys(board.columns)[0]

    const column = { ...board.columns[targetColId] }
    column.tasks = [...column.tasks, card]

    set({
      boards: {
        ...boards,
        [activeBoardId]: {
          ...board,
          columns: { ...board.columns, [targetColId]: column },
          archive,
        },
      },
    })
  },

  deleteArchivedCard: (cardId) => {
    if (!window.confirm('영구 삭제하시겠습니까?')) return
    const { boards, activeBoardId } = get()
    const board = boards[activeBoardId]
    const newCards = board.archive.cards.filter((c) => c.id !== cardId)
    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, archive: { cards: newCards } },
      },
    })
  },

  inviteMember: (email) => {
    const { boards, activeBoardId } = get()
    const board = boards[activeBoardId]
    const newMember = {
      id: `m-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'Member',
    }
    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...board, members: [...board.members, newMember] },
      },
    })
    // TODO: API 호출
  },
}))

export default useListStore
