import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sortable from 'sortablejs'
import useBoardStore from '../../stores/useBoardStore'
import BoardHeader from '../../components/board/BoardHeader'
import BoardCanvas from '../../components/board/BoardCanvas'
import BoardSettings from '../../components/board/BoardSettings'
import CardDetailModal from '../../components/modals/CardDetailModal'

/**
 * 보드 데이터 로딩,
 * 각 컴포넌트 배치 및 보드 데이터 전달
 */
function BoardPage() {
  // URL 파라미터 (/boards/{boardId})
  const { boardId } = useParams()

  const {
    activeBoard,
    fetchBoard,
    moveList,
    moveCard,
    selectedCard,
    isSettingsOpen,
    resetBoard,
    isLoading,
    error,
  } = useBoardStore()

  const navigate = useNavigate()

  // 각 리스트(컬럼)의 DOM 요소를 참조하기 위한 Ref 객체
  const columnRefs = useRef({})

  // 리스트 컨테이너 Ref
  const listContainerRef = useRef(null)

  // 컴포넌트 마운트 시 보드 데이터 불러오기
  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId, navigate)
    }
  }, [boardId, fetchBoard, resetBoard])

  // 리스트 이동 Sortable
  useEffect(() => {
    if (!activeBoard || !listContainerRef.current) return

    const listSortable = new Sortable(listContainerRef.current, {
      group: 'board-lists', // 카드와 다른 그룹명
      direction: 'horizontal', // 가로 방향 정렬
      animation: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',

      // 리스트 헤더(.board-list-header)를 잡았을 때만 드래그 가능
      handle: '.board-list-header',

      // 스타일 (필요시 index.css에 정의하여 사용 가능)
      ghostClass: 'opacity-50',

      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt
        if (
          oldIndex !== undefined &&
          newIndex !== undefined &&
          oldIndex !== newIndex
        ) {
          moveList(oldIndex, newIndex)
        }
      },
    })

    return () => listSortable.destroy()
  }, [activeBoard, moveList])

  // 카드 이동 Sortable
  useEffect(() => {
    if (!activeBoard) return

    const sortables = []
    const columns = activeBoard.columns || {}

    Object.keys(columns).forEach((colId) => {
      const el = columnRefs.current[colId]
      if (!el) return

      const sortable = new Sortable(el, {
        group: 'kanban',
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: (evt) => {
          const fromId = evt.from.dataset.columnId
          const toId = evt.to.dataset.columnId
          const { newIndex } = evt
          const cardId = Number(evt.item.dataset.id)

          if (fromId && toId && cardId) {
            // 리스트 간 이동 시 DOM 충돌 방지
            if (evt.from !== evt.to) {
              evt.from.appendChild(evt.item)
            }

            // React 상태 업데이트
            moveCard(cardId, fromId, toId, newIndex)
          }
        },
      })

      sortables.push(sortable)
    })

    return () => sortables.forEach((s) => s.destroy())
  }, [activeBoard, moveCard])

  // 로딩 및 에러 처리
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading board...
      </div>
    )

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    )

  if (!activeBoard) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-white">
      {/* 헤더 */}
      <BoardHeader board={activeBoard} />

      {/* 보드 랜더링 */}
      <main className="relative flex-1 overflow-hidden">
        <BoardCanvas
          board={activeBoard}
          columnRefs={columnRefs}
          listContainerRef={listContainerRef}
        />
      </main>

      {isSettingsOpen && <BoardSettings board={activeBoard} />}
      {selectedCard && <CardDetailModal board={activeBoard} />}
    </div>
  )
}

export default BoardPage
