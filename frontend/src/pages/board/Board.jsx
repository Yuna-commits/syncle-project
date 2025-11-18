import React, { useState, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

/**
 * 기본 컬럼/카드 구조
 */
const createInitialColumns = () => ({
  backlog: {
    id: 'backlog',
    title: 'Backlog',
    subtitle: '3 tasks',
    badgeClass:
      'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-100',
    headerTitleClass:
      'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    headerCountClass: 'text-xs font-medium text-gray-900 dark:text-gray-100',
    wrapperClass:
      'flex w-72 flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/90',
    tasks: [
      {
        id: 'b1',
        title: '디자인 시스템 컬러 토큰 정리',
        tag: 'Design',
        tagClass:
          'inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
        description:
          'Figma / Tailwind 색상 스케일 통일하고, 문서화까지 진행하기.',
        assigneeInitials: 'SW',
        assigneeBg:
          'inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
        assigneeName: '승욱',
        badge: '⏱ 3h',
        badgeClass:
          'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        variant: 'solid',
      },
      {
        id: 'b2',
        title: 'API 명세서 정리 (Swagger)',
        tag: 'Backend',
        tagClass:
          'inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
        description: '인증 / 게시판 / 알림 쪽 API 엔드포인트 확인하고 문서화.',
        assigneeInitials: 'BK',
        assigneeBg:
          'inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        assigneeName: 'Backend',
        badge: '🔁 Refine',
        badgeClass:
          'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        variant: 'dashed',
      },
      {
        id: 'b3',
        title: '기능 목록 우선순위 정리',
        tag: 'Planning',
        tagClass:
          'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-100',
        description: 'MVP 기준으로 지금 스프린트에서 처리할 기능 정리.',
        badge: '📌 High-level',
        badgeClass:
          'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        variant: 'dashed',
      },
    ],
  },
  todo: {
    id: 'todo',
    title: 'To Do',
    subtitle: '4 tasks',
    badgeClass:
      'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100',
    headerTitleClass:
      'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    headerCountClass: 'text-xs font-medium text-gray-900 dark:text-gray-100',
    wrapperClass:
      'flex w-72 flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/90',
    tasks: [
      {
        id: 't1',
        title: '로그인 / 회원가입 UI 구현',
        tag: 'Frontend',
        tagClass:
          'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200',
        description: 'Flowbite 컴포넌트 활용해서 반응형 로그인 화면 만들기.',
        assigneeInitials: 'UX',
        assigneeBg:
          'inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-[10px] font-semibold text-pink-700 dark:bg-pink-900/40 dark:text-pink-200',
        assigneeName: 'UI/UX',
        badge: '⚠ Due today',
        badgeClass:
          'inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/40 dark:text-red-200',
        variant: 'solid',
      },
      {
        id: 't2',
        title: 'Kanban drag & drop 조사',
        tag: 'Research',
        tagClass:
          'inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
        description:
          'HTML5 drag & drop / SortableJS / React-beautiful-dnd 비교.',
        badge: '⏱ 1.5h · 📎 2 attachments',
        badgeClass:
          'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        variant: 'dashed',
      },
      {
        id: 't3',
        title: 'Error 상태 UI 디자인',
        tag: 'Design',
        tagClass:
          'inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
        description: '404 / Empty / Error 상태 화면 레이아웃과 아이콘 정하기.',
        variant: 'solid',
      },
      {
        id: 't4',
        title: '반응형 브레이크포인트 정리',
        tag: 'Frontend',
        tagClass:
          'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200',
        description: '모바일 / 태블릿 / 데스크탑 기준 기능 노출 범위 정의.',
        variant: 'dashed',
      },
    ],
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    subtitle: '2 tasks',
    badgeClass:
      'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white',
    headerTitleClass:
      'text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200',
    headerCountClass: 'text-xs font-medium text-blue-950 dark:text-blue-100',
    wrapperClass:
      'flex w-72 flex-shrink-0 flex-col rounded-xl border border-blue-200 bg-blue-50/60 p-3 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/40',
    tasks: [
      {
        id: 'p1',
        title: 'Board 레이아웃 반응형 마크업',
        tag: 'Layout',
        tagClass:
          'inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
        description: '모바일에서는 가로 스크롤, 데스크탑에서는 4-column grid.',
        assigneeInitials: 'FE',
        assigneeBg:
          'inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
        assigneeName: 'Front',
        badge: '⏳ 60% done',
        badgeClass:
          'inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-100',
        variant: 'solid',
      },
      {
        id: 'p2',
        title: 'Dark mode 컬러 튜닝',
        tag: 'Dark',
        tagClass:
          'inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-100',
        description: '다크 모드에서 대비, 그림자, 보더 컬러 확인하기.',
        badge: '👀 Review with designer',
        badgeClass:
          'inline-flex items-center rounded-md bg-gray-900/10 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-100',
        variant: 'dashed',
      },
    ],
  },
  done: {
    id: 'done',
    title: 'Done',
    subtitle: '2 tasks',
    badgeClass:
      'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
    headerTitleClass:
      'text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300',
    headerCountClass: 'text-xs font-medium text-gray-900 dark:text-gray-100',
    wrapperClass:
      'flex w-72 flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/90',
    tasks: [
      {
        id: 'd1',
        title: 'Tailwind / Flowbite 셋업',
        tag: 'Setup',
        tagClass:
          'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
        description: 'CDN 방식으로 빠르게 실험용 UI 만들 수 있도록 구조 정리.',
        badge: '✅ Completed',
        badgeClass:
          'inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        variant: 'solid',
      },
      {
        id: 'd2',
        title: '기본 Kanban 컬럼 구조 정의',
        description:
          'Backlog / To Do / In Progress / Done 4단 컬럼으로 구조 확정.',
        variant: 'dashed',
      },
    ],
  },
})

/**
 * 기본 멤버 (보드 share 모달용)
 */
const defaultMembers = [
  {
    id: 'm-1',
    name: '승욱',
    email: 'you@example.com',
    role: 'Admin',
  },
  {
    id: 'm-2',
    name: 'Teammate',
    email: 'teammate@example.com',
    role: 'Member',
  },
]

const Board = () => {
  // 여러 Board 상태
  const [boards, setBoards] = useState(() => {
    const initialId = 'board-1'
    return {
      [initialId]: {
        id: initialId,
        name: 'Project Kanban',
        description: '',
        visibility: 'Private',
        columns: createInitialColumns(),
        archive: { cards: [] },
        members: defaultMembers,
      },
    }
  })
  const [activeBoardId, setActiveBoardId] = useState('board-1')

  // 리스트 / 카드 추가 상태
  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [addingCardColumnId, setAddingCardColumnId] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')

  // Board 설정 (우측 메뉴)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('about')

  // Board share 모달 (멤버 초대)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [inviteInput, setInviteInput] = useState('')

  // 카드 상세보기 모달
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardColumnId, setSelectedCardColumnId] = useState(null)

  // 카드 Actions 모달 (Trello Actions 버튼)
  const [isCardActionsOpen, setIsCardActionsOpen] = useState(false)

  // 카드별 코멘트
  const [cardComments, setCardComments] = useState({})
  const [newCommentText, setNewCommentText] = useState('')

  // 카드별 체크리스트
  const [cardChecklists, setCardChecklists] = useState({})
  const [checklistInput, setChecklistInput] = useState('')

  const columnRefs = useRef({})

  const activeBoard = boards[activeBoardId]
  const columns = activeBoard?.columns || {}
  const boardList = Object.values(boards)
  const archivedCards = activeBoard?.archive?.cards || []
  const visibilityOptions = ['Private', 'Workspace', 'Public']

  // 드래그 & 드롭 셋업 (Active board 기준)
  useEffect(() => {
    if (!activeBoard) return

    const sortables = []

    Object.keys(columns).forEach((columnId) => {
      const el = columnRefs.current[columnId]
      if (!el) return

      const sortable = new Sortable(el, {
        group: 'kanban',
        animation: 150,
        ghostClass: 'opacity-50',
        dragClass: 'ring-2 ring-blue-400',
        onEnd: (evt) => {
          const fromId = evt.from.dataset.columnId
          const toId = evt.to.dataset.columnId
          const oldIndex = evt.oldIndex
          const newIndex = evt.newIndex

          if (!fromId || !toId) return
          if (oldIndex == null || newIndex == null) return

          setBoards((prev) => {
            const board = prev[activeBoardId]
            if (!board) return prev

            const newColumns = { ...board.columns }
            const fromCol = { ...newColumns[fromId] }
            const fromTasks = [...fromCol.tasks]
            const [moved] = fromTasks.splice(oldIndex, 1)
            if (!moved) return prev

            fromCol.tasks = fromTasks
            newColumns[fromId] = fromCol

            if (!newColumns[toId]) return prev
            const toCol = fromId === toId ? fromCol : { ...newColumns[toId] }
            const toTasks = fromId === toId ? fromTasks : [...toCol.tasks]

            toTasks.splice(newIndex, 0, moved)
            toCol.tasks = toTasks
            newColumns[toId] = toCol

            return {
              ...prev,
              [activeBoardId]: {
                ...board,
                columns: newColumns,
              },
            }
          })
        },
      })

      sortables.push(sortable)
    })

    return () => {
      sortables.forEach((s) => s.destroy())
    }
  }, [activeBoardId, columns, activeBoard])

  if (!activeBoard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No board selected.
        </p>
      </div>
    )
  }

  // --- Board CRUD & 상태 업데이트 로직들 ---

  // 새 Board 생성
  const handleCreateBoard = () => {
    const id = `board-${Date.now().toString(36)}`
    setBoards((prev) => ({
      ...prev,
      [id]: {
        id,
        name: `New board ${Object.keys(prev).length + 1}`,
        description: '',
        visibility: 'Private',
        columns: createInitialColumns(),
        archive: { cards: [] },
        members: defaultMembers,
      },
    }))
    setActiveBoardId(id)
  }

  // Board 삭제
  const handleDeleteBoard = () => {
    if (!window.confirm('이 보드를 삭제할까요? (되돌릴 수 없습니다)')) {
      return
    }

    setBoards((prev) => {
      const ids = Object.keys(prev)
      if (ids.length <= 1) {
        alert('마지막 보드는 삭제할 수 없습니다.')
        return prev
      }

      const newBoards = { ...prev }
      delete newBoards[activeBoardId]

      const remainingIds = Object.keys(newBoards)
      const nextId = remainingIds[0]
      setActiveBoardId(nextId)

      return newBoards
    })

    setIsSettingsOpen(false)
    setIsShareOpen(false)
    setSelectedCard(null)
    setSelectedCardColumnId(null)
    setIsCardActionsOpen(false)
  }

  // List 추가
  const handleAddList = (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return

    const newId = `list-${Date.now().toString(36)}`

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const newColumns = {
        ...board.columns,
        [newId]: {
          id: newId,
          title,
          subtitle: '0 tasks',
          badgeClass:
            'inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-100',
          headerTitleClass:
            'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
          headerCountClass:
            'text-xs font-medium text-gray-900 dark:text-gray-100',
          wrapperClass:
            'flex w-72 flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/90',
          tasks: [],
        },
      }

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: newColumns,
        },
      }
    })

    setNewListTitle('')
    setAddingList(false)
  }

  // List 삭제
  const handleDeleteList = (columnId) => {
    if (!window.confirm('이 리스트와 안의 카드들을 모두 삭제할까요?')) {
      return
    }

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const newColumns = { ...board.columns }
      delete newColumns[columnId]

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: newColumns,
        },
      }
    })
  }

  // Card 추가
  const handleAddCardSubmit = (e, columnId) => {
    e.preventDefault()
    const title = newCardTitle.trim()
    if (!title) return

    const newId = `card-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const columns = { ...board.columns }
      const col = columns[columnId]
      if (!col) return prev

      const newTask = {
        id: newId,
        title,
        description: '',
        variant: 'solid',
      }

      const updatedCol = {
        ...col,
        tasks: [...col.tasks, newTask],
      }

      columns[columnId] = updatedCol

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns,
        },
      }
    })

    setNewCardTitle('')
    setAddingCardColumnId(null)
  }

  // Card 아카이브 (Archive 탭으로 이동)
  const handleArchiveCard = (columnId, taskId) => {
    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const columns = { ...board.columns }
      const col = { ...columns[columnId] }
      if (!col) return prev

      const tasks = [...col.tasks]
      const idx = tasks.findIndex((t) => t.id === taskId)
      if (idx === -1) return prev

      const [task] = tasks.splice(idx, 1)
      col.tasks = tasks
      columns[columnId] = col

      const archive = board.archive || { cards: [] }
      const archivedCard = {
        id: task.id,
        title: task.title,
        description: task.description,
        originalColumnId: columnId,
        originalColumnTitle: col.title,
        archivedAt: new Date().toISOString(),
      }

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns,
          archive: {
            ...archive,
            cards: [...archive.cards, archivedCard],
          },
        },
      }
    })
  }

  // Archive → 보드로 복원
  const handleRestoreArchivedCard = (archivedId) => {
    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const archive = board.archive || { cards: [] }
      const idx = archive.cards.findIndex((c) => c.id === archivedId)
      if (idx === -1) return prev

      const archivedCard = archive.cards[idx]

      const columns = { ...board.columns }
      const targetId = archivedCard.originalColumnId
      let targetCol = columns[targetId]

      const fallbackId = targetCol ? targetId : Object.keys(columns)[0]
      if (!fallbackId) return prev

      targetCol = columns[fallbackId]

      const restoredTask = {
        id: archivedCard.id,
        title: archivedCard.title,
        description: archivedCard.description,
        variant: 'solid',
      }

      columns[fallbackId] = {
        ...targetCol,
        tasks: [...targetCol.tasks, restoredTask],
      }

      const newCards = [...archive.cards]
      newCards.splice(idx, 1)

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns,
          archive: {
            ...archive,
            cards: newCards,
          },
        },
      }
    })
  }

  // Archive에서 완전 삭제
  const handleDeleteArchivedCard = (archivedId) => {
    if (!window.confirm('이 카드의 아카이브 기록을 완전히 삭제할까요?')) {
      return
    }

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const archive = board.archive || { cards: [] }
      const newCards = archive.cards.filter((c) => c.id !== archivedId)

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          archive: {
            ...archive,
            cards: newCards,
          },
        },
      }
    })
  }

  // Visibility 변경
  const updateVisibility = (value) => {
    setBoards((prev) => ({
      ...prev,
      [activeBoardId]: {
        ...prev[activeBoardId],
        visibility: value,
      },
    }))
  }

  // --- Share 모달 (Board 멤버 초대) 로직 ---

  const handleInviteMember = (e) => {
    e.preventDefault()
    const value = inviteInput.trim()
    if (!value) return

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const members = board.members || []
      const nextIndex = members.length + 1

      const newMember = {
        id: `m-${Date.now().toString(36)}-${nextIndex}`,
        name: value.includes('@') ? value.split('@')[0] : value,
        email: value.includes('@') ? value : '',
        role: 'Member',
      }

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          members: [...members, newMember],
        },
      }
    })

    setInviteInput('')
  }

  // --- 카드 상세 모달 로직 ---

  const handleOpenCardModal = (columnId, task) => {
    setSelectedCard(task)
    setSelectedCardColumnId(columnId)
    setNewCommentText('')
    setChecklistInput('')
    setIsCardActionsOpen(false)
  }

  const handleCloseCardModal = () => {
    setSelectedCard(null)
    setSelectedCardColumnId(null)
    setNewCommentText('')
    setChecklistInput('')
    setIsCardActionsOpen(false)
  }

  const handleUpdateCardDescription = (value) => {
    if (!selectedCard || !selectedCardColumnId) return

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const columns = { ...board.columns }
      const col = { ...columns[selectedCardColumnId] }
      const tasks = [...col.tasks]
      const idx = tasks.findIndex((t) => t.id === selectedCard.id)
      if (idx === -1) return prev

      const updatedTask = { ...tasks[idx], description: value }
      tasks[idx] = updatedTask
      col.tasks = tasks
      columns[selectedCardColumnId] = col

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns,
        },
      }
    })

    setSelectedCard((prev) => (prev ? { ...prev, description: value } : prev))
  }

  // Move card (Current sprint - Move card: Inbox 제외)
  const handleMoveCardFromModal = (newColumnId) => {
    if (!selectedCard || !selectedCardColumnId) return
    if (newColumnId === selectedCardColumnId) return

    setBoards((prev) => {
      const board = prev[activeBoardId]
      if (!board) return prev

      const columns = { ...board.columns }
      const fromCol = columns[selectedCardColumnId]
      const toCol = columns[newColumnId]
      if (!fromCol || !toCol) return prev

      const newFromCol = { ...fromCol }
      const fromTasks = [...newFromCol.tasks]
      const idx = fromTasks.findIndex((t) => t.id === selectedCard.id)
      if (idx === -1) return prev

      const [moved] = fromTasks.splice(idx, 1)
      newFromCol.tasks = fromTasks

      const newToCol = {
        ...toCol,
        tasks: [...toCol.tasks, moved],
      }

      const newColumns = {
        ...columns,
        [selectedCardColumnId]: newFromCol,
        [newColumnId]: newToCol,
      }

      return {
        ...prev,
        [activeBoardId]: {
          ...board,
          columns: newColumns,
        },
      }
    })

    setSelectedCardColumnId(newColumnId)
  }

  // 댓글 추가 (Comments & Activity)
  const handleAddComment = (e) => {
    e.preventDefault()
    const text = newCommentText.trim()
    if (!text || !selectedCard) return

    const entry = {
      id: `c-${Date.now().toString(36)}`,
      text,
      createdAt: new Date().toISOString(),
    }

    setCardComments((prev) => {
      const old = prev[selectedCard.id] || []
      return {
        ...prev,
        [selectedCard.id]: [...old, entry],
      }
    })

    setNewCommentText('')
  }

  // 체크리스트: Add to card → Checklist 버튼
  const handleAddChecklistForSelectedCard = () => {
    if (!selectedCard) return
    setCardChecklists((prev) => {
      const existing = prev[selectedCard.id] || []
      if (existing.length > 0) return prev

      const newChecklist = {
        id: `chk-${Date.now().toString(36)}`,
        title: 'Checklist',
        items: [],
      }

      return {
        ...prev,
        [selectedCard.id]: [...existing, newChecklist],
      }
    })
  }

  const handleAddChecklistItem = (e) => {
    e.preventDefault()
    if (!selectedCard) return
    const text = checklistInput.trim()
    if (!text) return

    setCardChecklists((prev) => {
      const lists = prev[selectedCard.id] || []
      if (lists.length === 0) return prev

      const first = lists[0]
      const rest = lists.slice(1)
      const newItem = {
        id: `item-${Date.now().toString(36)}`,
        text,
        done: false,
      }
      const updatedFirst = {
        ...first,
        items: [...first.items, newItem],
      }

      return {
        ...prev,
        [selectedCard.id]: [updatedFirst, ...rest],
      }
    })

    setChecklistInput('')
  }

  const handleToggleChecklistItem = (checklistId, itemId) => {
    if (!selectedCard) return

    setCardChecklists((prev) => {
      const lists = prev[selectedCard.id] || []
      const updated = lists.map((cl) => {
        if (cl.id !== checklistId) return cl
        return {
          ...cl,
          items: cl.items.map((it) =>
            it.id === itemId ? { ...it, done: !it.done } : it,
          ),
        }
      })

      return {
        ...prev,
        [selectedCard.id]: updated,
      }
    })
  }

  const columnsArray = Object.values(columns)
  const currentColumnTitle =
    selectedCardColumnId && columns[selectedCardColumnId]
      ? columns[selectedCardColumnId].title
      : ''
  const commentsForSelectedCard =
    selectedCard && cardComments[selectedCard.id]
      ? cardComments[selectedCard.id]
      : []
  const checklistsForSelectedCard =
    selectedCard && cardChecklists[selectedCard.id]
      ? cardChecklists[selectedCard.id]
      : []
  const members = activeBoard.members || []

  // 체크리스트 진행률 계산 (간단)
  let checklistProgressText = ''
  if (checklistsForSelectedCard.length > 0) {
    const cl = checklistsForSelectedCard[0]
    const total = cl.items.length
    const done = cl.items.filter((i) => i.done).length
    if (total > 0) {
      checklistProgressText = `${done}/${total}`
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        {/* 상단 헤더 */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:bg-gray-800/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
                KB
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                    {activeBoard.name}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    {activeBoard.visibility}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drag &amp; drop Kanban board with lists &amp; cards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 보드 셀렉터 */}
              <select
                value={activeBoardId}
                onChange={(e) => setActiveBoardId(e.target.value)}
                className="hidden rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm hover:bg-gray-50 sm:inline-block dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                {boardList.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>

              {/* Share / Invite 버튼 */}
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Share
              </button>

              {/* 새 보드 생성 */}
              <button
                type="button"
                onClick={handleCreateBoard}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                + New board
              </button>

              {/* Board Menu (우측 설정 패널) */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Board menu
              </button>
            </div>
          </div>
        </header>

        {/* 메인 보드 */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="flex min-w-full gap-4 lg:gap-6">
              {columnsArray.map((col) => (
                <section key={col.id} className={col.wrapperClass}>
                  {/* 컬럼 헤더 */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className={col.headerTitleClass}>{col.title}</h2>
                      <p className={col.headerCountClass}>{col.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={col.badgeClass}>{col.tasks.length}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteList(col.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                        title="Delete list"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* 카드 리스트 (Sortable 영역) */}
                  <div
                    className="mb-2 space-y-3"
                    data-column-id={col.id}
                    ref={(el) => (columnRefs.current[col.id] = el)}
                  >
                    {col.tasks.map((task) => (
                      <article
                        key={task.id}
                        onClick={() => handleOpenCardModal(col.id, task)}
                        className={
                          'group cursor-pointer rounded-lg border p-3 text-sm shadow-sm transition hover:border-blue-500 hover:shadow-md ' +
                          (task.variant === 'dashed'
                            ? 'border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                            : col.id === 'inProgress'
                              ? 'border-blue-200 bg-white dark:border-blue-900/60 dark:bg-gray-900/80'
                              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800')
                        }
                      >
                        <header className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                              {task.title}
                            </h3>
                            {task.tag && (
                              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                                {task.tag}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveCard(col.id, task.id)
                            }}
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                            title="Archive card"
                          >
                            ⌫
                          </button>
                        </header>

                        {task.description && (
                          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}

                        <footer className="flex items-center justify-between">
                          {(task.assigneeInitials || task.assigneeName) && (
                            <div className="flex items-center gap-1.5">
                              {task.assigneeInitials && (
                                <span className={task.assigneeBg}>
                                  {task.assigneeInitials}
                                </span>
                              )}
                              {task.assigneeName && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {task.assigneeName}
                                </span>
                              )}
                            </div>
                          )}

                          {task.badge && (
                            <span className={task.badgeClass}>
                              {task.badge}
                            </span>
                          )}
                        </footer>
                      </article>
                    ))}
                  </div>

                  {/* 카드 추가 UI */}
                  {addingCardColumnId === col.id ? (
                    <form
                      onSubmit={(e) => handleAddCardSubmit(e, col.id)}
                      className="mt-1 space-y-2"
                    >
                      <input
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        autoFocus
                        placeholder="Card title"
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      />
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Add card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingCardColumnId(null)
                            setNewCardTitle('')
                          }}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCardColumnId(col.id)
                        setNewCardTitle('')
                      }}
                      className="mt-1 w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2 py-1.5 text-left text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-300"
                    >
                      + Add card
                    </button>
                  )}
                </section>
              ))}

              {/* 새 리스트 추가용 칸 */}
              <div className="flex w-72 flex-shrink-0 items-start">
                {addingList ? (
                  <form
                    onSubmit={handleAddList}
                    className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                      placeholder="List title"
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                    <div className="mt-2 flex gap-1">
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Add list
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingList(false)
                          setNewListTitle('')
                        }}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingList(true)}
                    className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-300"
                  >
                    + Add another list
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Board Share 모달 --- */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsShareOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Share board
              </h2>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3">
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Invite people to{' '}
                <span className="font-semibold">{activeBoard.name}</span>.
              </p>

              <form onSubmit={handleInviteMember} className="mb-4 space-y-2">
                <label className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
                  Email or name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Invite
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <h3 className="mb-2 text-[11px] font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Board members
                </h3>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No members yet.
                    </p>
                  ) : (
                    members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-100">
                            {m.name?.[0]?.toUpperCase() || 'M'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {m.name}
                            </p>
                            {m.email && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {m.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {m.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 카드 상세보기 모달 (Trello 스타일) --- */}
      {selectedCard && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCloseCardModal}
          />
          <div className="relative z-40 mt-10 mb-10 w-full max-w-4xl rounded-lg bg-gray-50 shadow-2xl dark:bg-gray-900">
            {/* 헤더 */}
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-500 dark:text-gray-400">
                  📋
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedCard.title}
                  </h2>
                  {currentColumnTitle && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      in list{' '}
                      <span className="font-medium">{currentColumnTitle}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCardActionsOpen(true)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Actions
                </button>
                <button
                  type="button"
                  onClick={handleCloseCardModal}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 내용: 좌측(상세/댓글) + 우측(Add to card) */}
            <div className="flex flex-col gap-6 px-6 py-4 md:flex-row">
              {/* 왼쪽 영역 */}
              <div className="flex-1 space-y-6">
                {/* Current sprint - Move card */}
                <section>
                  <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Current sprint
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Move card:
                    </span>
                    <select
                      value={selectedCardColumnId || ''}
                      onChange={(e) => handleMoveCardFromModal(e.target.value)}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {columnsArray
                        .filter((c) => c.title !== 'Inbox')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </section>

                {/* Description */}
                <section>
                  <h3 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </h3>
                  <textarea
                    rows={3}
                    value={selectedCard.description || ''}
                    onChange={(e) =>
                      handleUpdateCardDescription(e.target.value)
                    }
                    placeholder="Add a more detailed description..."
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </section>

                {/* Checklist (Description 아래) */}
                <section>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Checklist
                    </h3>
                    {checklistProgressText && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {checklistProgressText}
                      </span>
                    )}
                  </div>
                  {checklistsForSelectedCard.length === 0 ? (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      No checklist yet. Use{' '}
                      <span className="font-medium">Checklist</span> in the{' '}
                      <span className="font-medium">Add to card</span> section
                      on the right to create one.
                    </p>
                  ) : (
                    checklistsForSelectedCard.map((cl) => (
                      <div key={cl.id} className="mt-2">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                          {cl.title}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {cl.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() =>
                                  handleToggleChecklistItem(cl.id, item.id)
                                }
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span
                                className={
                                  'text-[11px] ' +
                                  (item.done
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-700 dark:text-gray-200')
                                }
                              >
                                {item.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <form
                          onSubmit={handleAddChecklistItem}
                          className="mt-2 flex gap-2"
                        >
                          <input
                            type="text"
                            value={checklistInput}
                            onChange={(e) => setChecklistInput(e.target.value)}
                            placeholder="Add an item"
                            className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </section>

                {/* Comments & Activity */}
                <section>
                  <h3 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Comments
                  </h3>
                  <form onSubmit={handleAddComment} className="mb-3 space-y-2">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </form>

                  <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Activity
                  </h4>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {commentsForSelectedCard.length === 0 ? (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        No activity yet.
                      </p>
                    ) : (
                      commentsForSelectedCard.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-md bg-white px-2 py-1.5 text-xs shadow-sm dark:bg-gray-800"
                        >
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-semibold">You</span>{' '}
                            commented:
                          </p>
                          <p className="mt-1 text-gray-700 dark:text-gray-200">
                            {c.text}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* 오른쪽 영역: Add to card (Trello 스타일, Cover 제외) */}
              <div className="w-full border-t border-gray-200 pt-4 md:w-72 md:border-t-0 md:border-l md:pl-4 dark:border-gray-800">
                <div>
                  <h3 className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Add to card
                  </h3>
                  <div className="mt-2 space-y-2">
                    {['Members', 'Checklist', 'Dates', 'Attachment'].map(
                      (label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (label === 'Checklist') {
                              handleAddChecklistForSelectedCard()
                            }
                            // 다른 버튼들은 UI만, 동작은 생략 (Trello 스타일용)
                          }}
                          className="flex w-full items-center justify-between rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                        >
                          <span>{label}</span>
                          <span>+</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 카드 Actions 모달 (share / archive만) --- */}
      {isCardActionsOpen && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCardActionsOpen(false)}
          />
          <div className="relative z-50 w-full max-w-xs rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Actions
              </h2>
              <button
                type="button"
                onClick={() => setIsCardActionsOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsCardActionsOpen(false)
                  setIsShareOpen(true)
                }}
                className="flex w-full items-center justify-between rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                <span>Share</span>
                <span>↗</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedCard && selectedCardColumnId) {
                    handleArchiveCard(selectedCardColumnId, selectedCard.id)
                  }
                  setIsCardActionsOpen(false)
                  handleCloseCardModal()
                }}
                className="flex w-full items-center justify-between rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-red-900/30 dark:hover:text-red-300"
              >
                <span>Archive</span>
                <span>⌫</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Trello 스타일 Board Menu (설정 패널) --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsSettingsOpen(false)}
          />
          <aside className="relative z-40 flex h-full w-full max-w-xs flex-col border-l border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Board menu
              </h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="border-b border-gray-200 px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase dark:border-gray-700 dark:text-gray-400">
              Menu
            </div>

            <div className="space-y-1 px-3 py-2">
              <button
                type="button"
                onClick={() => setSettingsTab('about')}
                className={
                  'flex w-full items-center rounded-md px-2 py-2 text-xs ' +
                  (settingsTab === 'about'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800')
                }
              >
                About this board
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('visibility')}
                className={
                  'flex w-full items-center rounded-md px-2 py-2 text-xs ' +
                  (settingsTab === 'visibility'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800')
                }
              >
                Visibility
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('archive')}
                className={
                  'flex w-full items-center rounded-md px-2 py-2 text-xs ' +
                  (settingsTab === 'archive'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800')
                }
              >
                Archive
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* About this board */}
              {settingsTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      About this board
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      이 보드의 이름과 설명을 설정해서 팀원들에게 컨텍스트를
                      제공할 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      Board name
                    </label>
                    <input
                      type="text"
                      value={activeBoard.name}
                      onChange={(e) =>
                        setBoards((prev) => ({
                          ...prev,
                          [activeBoardId]: {
                            ...prev[activeBoardId],
                            name: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={activeBoard.description || ''}
                      onChange={(e) =>
                        setBoards((prev) => ({
                          ...prev,
                          [activeBoardId]: {
                            ...prev[activeBoardId],
                            description: e.target.value,
                          },
                        }))
                      }
                      placeholder="이 보드가 어떤 일을 위한 것인지 적어주세요."
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleDeleteBoard}
                      className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-500/60 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                    >
                      Delete this board
                    </button>
                  </div>
                </div>
              )}

              {/* Visibility */}
              {settingsTab === 'visibility' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Visibility
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      이 보드를 누가 볼 수 있는지 설정합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {visibilityOptions.map((option) => {
                      const isActive = activeBoard.visibility === option
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateVisibility(option)}
                          className={
                            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs ' +
                            (isActive
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500')
                          }
                        >
                          <span>{option}</span>
                          {isActive && <span>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Archive */}
              {settingsTab === 'archive' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Archive
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      보드에서 아카이브한 카드 목록입니다. 다시 꺼내거나 완전히
                      삭제할 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {archivedCards.length === 0 ? (
                      <p className="text-xs text-gray-500 italic dark:text-gray-400">
                        아직 아카이브된 카드가 없습니다.
                      </p>
                    ) : (
                      archivedCards.map((card) => (
                        <div
                          key={card.id}
                          className="rounded-md border border-gray-200 bg-white p-2 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {card.title}
                              </p>
                              {card.originalColumnTitle && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  From list: {card.originalColumnTitle}
                                </p>
                              )}
                              {card.archivedAt && (
                                <p className="text-[11px] text-gray-400">
                                  Archived at:{' '}
                                  {new Date(card.archivedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreArchivedCard(card.id)}
                              className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArchivedCard(card.id)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-[11px] text-gray-600 hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-500 dark:hover:text-red-400"
                            >
                              Delete permanently
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

export default Board
