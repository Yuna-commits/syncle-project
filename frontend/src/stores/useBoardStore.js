import { create } from 'zustand'

// --- 초기 데이터 생성 헬퍼 ---
const createInitialColumns = () => ({
  'col-1': {
    id: 'col-1',
    title: 'To Do',
    tasks: [
      {
        id: 't1',
        title: '로그인 페이지 기획',
        description: '피그마 참조',
        variant: 'solid',
        tag: 'Design',
      },
      {
        id: 't2',
        title: '상태 관리 설계',
        description: 'Zustand 도입',
        variant: 'solid',
        tag: 'Front',
      },
    ],
  },
  'col-2': {
    id: 'col-2',
    title: 'In Progress',
    tasks: [
      {
        id: 't3',
        title: '대시보드 레이아웃',
        description: '',
        variant: 'solid',
        tag: 'Front',
      },
    ],
  },
  'col-3': {
    id: 'col-3',
    title: 'Done',
    tasks: [],
  },
})

const defaultMembers = [
  { id: 'm1', name: '김철수', email: 'kim@test.com', role: 'Owner' },
  { id: 'm2', name: '이영희', email: 'lee@test.com', role: 'Member' },
]

const initialData = {
  'board-1': {
    id: 'board-1',
    name: 'Project Kanban',
    description: '메인 프로젝트 보드입니다.',
    visibility: 'Private',
    columns: createInitialColumns(),
    archive: { cards: [] },
    members: defaultMembers,
  },
}

// =====================================

const useBoardStore = create((set, get) => ({
  // 상태
  boards: initialData, // 전체 보드 데이터
  activeBoardId: 'board-1', // 현재 화면에 표시된 보드 id

  // UI 상태 (모달 등)
  selectedCard: null, // 현재 열린 카드
  selectedColumnId: null, // 현재 열린 카드의 리스트 ID
  isSettingsOpen: false, // 설정 사이드바 열림 여부
  isShareOpen: false,
  isCardActionsOpen: false, // 카드 상세 모달 내 액션 메뉴

  // 상세 데이터 (댓글, 체크리스트) - 실제로는 DB에서 별도 조회
  cardComments: {},
  cardChecklists: {},

  // === 액션 ===

  // 0. 모달 제어
  openCardModal: (card, columnId) =>
    set({
      selectedCard: card,
      selectedCardColumnId: columnId,
      isCardActionsOpen: false,
    }),
  closeCardModal: () =>
    set({
      selectedCard: null,
      selectedCardColumnId: null,
      isCardActionsOpen: false,
    }),
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  toggleShare: () => set((state) => ({ isShareOpen: !state.isShareOpen })),
  toggleCardActions: () =>
    set((state) => ({ isCardActionsOpen: !state.isCardActionsOpen })),

  // 1. 보드 데이터 가져오기
  fetchBoard: async (boardId) => {
    /**
     * TODO) GET /boards
     */
    set({ activeBoardId: boardId })
  },

  // 2. 보드 정보 수정
  updateBoardInfo: (key, value) => {
    const { boards, activeBoardId } = get()
    /**
     * TODO) PATCH /boards/{boardId}
     */
    set({
      boards: {
        ...boards,
        [activeBoardId]: { ...boards[activeBoardId], [key]: value },
      },
    })
  },

  /**
   * TODO) 보드 삭제
   */

  // 3. 리스트 추가
  addList: (title) => {
    const { activeBoardId, boards } = get()
    const newId = `list-${Date.now()}`

    // 현재 화면에 표시할 보드
    const board = boards[activeBoardId]

    // 현재 보드에 추가할 새로운 리스트 구조 생성
    const newColums = {
      ...board.columns,
      [newId]: {
        id: newId,
        title,
        subtitle: '0 tasks',
        badgeClass: 'bg-gray-100 text-gray-700',
        tasks: [],
      },
    }

    set((state) => ({
      // 전체 보드 데이터 중에서 현재 표시된 보드의 상태 변경
      boards: {
        ...state.boards,
        [activeBoardId]: { ...board, colums: newColums },
      },
    }))

    /**
     * TODO) 추가된 리스트 정보 POST /boards/{boardId}/lists
     */
  },

  /**
   * TODO) 리스트 삭제
   */

  // 3. 카드 추가
  addCard: (columnId, title) => {
    const { activeBoardId, boards } = get()
    const newId = `card-${Date.now()}`
    const newTask = {
      id: newId,
      title,
      description: '',
      variant: 'solid',
      tag: '',
    }

    // 현재 표시된 보드와 리스트 정보
    const board = boards[activeBoardId]
    const column = board.columns[columnId]

    // 현재 보드에 속한 리스트에 새로운 카드 정보 추가
    const newColumns = {
      ...board.column,
      [columnId]: { ...column, tasks: [...column.tasks, newTask] },
    }

    set((state) => ({
      // 새로운 카드가 저장된 리스트로 현재 보드의 상태 변경
      boards: {
        ...state.boards,
        [activeBoardId]: { ...board, columns: newColumns },
      },
    }))
  },

  /**
   * TODO) 카드 상세 정보 수정
   */
  updateCardDescription: (description) => {
    const { boards, activeBoardId, selectedCard, selectedCardColumnId } = get()
    if (!selectedCard) return

    const board = boards[activeBoardId]
    const column = board.columns[selectedCardColumnId]
    const tasks = column.tasks.map((t) =>
      t.id === selectedCard.id ? { ...t, description } : t,
    )

    const newColumns = {
      ...board.columns,
      [selectedCardColumnId]: { ...column, tasks },
    }

    set({
      boards: { ...boards, [activeBoardId]: { ...board, columns: newColumns } },
      selectedCard: { ...selectedCard, description },
    })
  },

  // 4. 카드 이동 드래그 앤 드롭
  moveCard: (fromColId, toColId, oldIndex, newIndex) => {
    const { activeBoardId, boards } = get()
    const board = boards[activeBoardId]

    // 깊은 복사 -> 불변성 유지
    // 이동한 카드가 담길 리스트(컬럼) 정보
    const newColumns = { ...board.columns }
    const fromCol = { ...newColumns[fromColId] } // 출발지 리스트
    const toCol = fromColId === toColId ? fromCol : { ...newColumns[toColId] } // 목적지 리스트

    const fromTasks = [...fromCol.tasks] // 출발 리스트의 카드들
    const toTasks = fromColId === toColId ? fromTasks : [...toCol.tasks] // 목적 리스트의 카드들

    // 이동 로직
    const [movedTask] = fromTasks.splice(oldIndex, 1) // 인덱스 조정 (-1)
    toTasks.splice(newIndex, 0, movedTask) // 새로운 카드 추가

    // 영향 받은 두 리스트의 카드 정보 갱신
    fromCol.tasks = fromTasks
    toCol.tasks = toTasks

    // 영향 받은 두 리스트 정보 갱신
    newColumns[fromColId] = fromCol
    newColumns[toColId] = toCol

    // 보드 정보 갱신
    set((state) => ({
      boards: {
        ...state.boards,
        [activeBoardId]: {
          ...board,
          columns: newColumns,
        },
      },
    }))

    /**
     * TODO) api
     */
  },

  moveCardFromModal: (newColumnId) => {
    const {
      selectedCard,
      selectedCardColumnId,
      moveCard,
      boards,
      activeBoardId,
    } = get()
    if (!selectedCard || newColumnId === selectedCardColumnId) return

    const board = boards[activeBoardId]
    const oldCol = board.columns[selectedCardColumnId]
    const newCol = board.columns[newColumnId]

    const oldIndex = oldCol.tasks.findIndex((t) => t.id === selectedCard.id)
    const newIndex = newCol.tasks.length // 맨 뒤로 이동

    moveCard(selectedCardColumnId, newColumnId, oldIndex, newIndex)
    set({ selectedCardColumnId: newColumnId })
  },

  // 7. 아카이브 (Archive)
  // 아카이브 상태 관리
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
      isCardActionsOpen: false,
      selectedCard: null,
    })
  },

  // 아카이브에 카드 저장
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

  // 아카이브에서 카드 삭제
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

  // 8. 멤버 초대
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
  },

  // 9. 댓글 및 체크리스트
  addComment: (text) => {
    const { selectedCard, cardComments } = get()
    if (!selectedCard) return
    const newComment = {
      id: `c-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    }

    set({
      cardComments: {
        ...cardComments,
        [selectedCard.id]: [
          ...(cardComments[selectedCard.id] || []),
          newComment,
        ],
      },
    })
  },

  addChecklist: () => {
    const { selectedCard, cardChecklists } = get()
    if (!selectedCard) return
    const newChecklist = {
      id: `cl-${Date.now()}`,
      title: 'Checklist',
      items: [],
    }

    set({
      cardChecklists: {
        ...cardChecklists,
        [selectedCard.id]: [
          ...(cardChecklists[selectedCard.id] || []),
          newChecklist,
        ],
      },
    })
  },

  addChecklistItem: (text) => {
    const { selectedCard, cardChecklists } = get()
    if (!selectedCard) return

    const lists = cardChecklists[selectedCard.id] || []
    if (lists.length === 0) return // 체크리스트가 없으면 추가 불가

    const newItem = { id: `item-${Date.now()}`, text, done: false }
    const updatedLists = [...lists]
    updatedLists[0] = {
      ...updatedLists[0],
      items: [...updatedLists[0].items, newItem],
    }

    set({
      cardChecklists: { ...cardChecklists, [selectedCard.id]: updatedLists },
    })
  },

  toggleChecklistItem: (checklistId, itemId) => {
    const { selectedCard, cardChecklists } = get()
    if (!selectedCard) return

    const lists = cardChecklists[selectedCard.id].map((cl) => {
      if (cl.id !== checklistId) return cl
      return {
        ...cl,
        items: cl.items.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item,
        ),
      }
    })

    set({
      cardChecklists: { ...cardChecklists, [selectedCard.id]: lists },
    })
  },
}))

export default useBoardStore
