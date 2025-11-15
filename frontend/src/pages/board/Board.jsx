import React, { useState, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

// 초기 보드가 사용할 기본 컬럼/카드 구조
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
        archive: { cards: [] }, // 아카이브된 카드들
      },
    }
  })
  const [activeBoardId, setActiveBoardId] = useState('board-1')

  // 새 List / 새 Card 입력 상태
  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [addingCardColumnId, setAddingCardColumnId] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')

  // Board 설정 (Trello Menu 스타일)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('about') // about | visibility | archive

  const columnRefs = useRef({})

  const activeBoard = boards[activeBoardId]
  const columns = activeBoard?.columns || {}
  const boardList = Object.values(boards)
  const archivedCards = activeBoard?.archive?.cards || []
  const visibilityOptions = ['Private', 'Workspace', 'Public']

  // 드래그 & 드롭 셋업
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

  // List 삭제 (완전 삭제)
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

  // Card 아카이브 (삭제 대신 Archive로 보내기)
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

  // Archive → 원래 보드로 복원
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

      // 원래 리스트가 없으면 첫 번째 리스트에 복원
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

  const columnsArray = Object.values(columns)

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
              <button
                type="button"
                onClick={handleCreateBoard}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                + New board
              </button>
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
                        className={
                          'group rounded-lg border p-3 text-sm shadow-sm transition hover:border-blue-500 hover:shadow-md ' +
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
                            onClick={() => handleArchiveCard(col.id, task.id)}
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

      {/* Trello 스타일 Board Menu (Settings) */}
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
