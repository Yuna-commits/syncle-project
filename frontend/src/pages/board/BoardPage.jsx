import React, { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'
import useBoardStore from '../../stores/useBoardStore'
import BoardHeader from '../../components/board/BoardHeader'
import BoardCanvas from '../../components/board/BoardCanvas'
import BoardSettings from '../../components/modals/BoardSettings'
import CardDetailModal from '../../components/modals/CardDetailModal'

/**
 * 보드 데이터 로딩,
 * 각 컴포넌트 배치 및 보드 데이터 전달
 */
function BoardPage() {
  const { boards, activeBoardId, moveCard, selectedCard, isSettingsOpen } =
    useBoardStore()

  // 현재 화면에 표시할 보드
  const activeBoard = boards[activeBoardId]

  // 각 리스트(컬럼)의 DOM 요소를 참조하기 위한 Ref 객체
  // {key: columnId, value: HTMLDiveElement}
  const columnRefs = useRef({})

  // SortableJS 초기화 (드래그 앤 드롭)
  useEffect(() => {
    if (!activeBoard) return

    const sortables = []
    const columns = activeBoard.columns

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
          const { oldIndex, newIndex } = evt

          if (
            fromId &&
            toId &&
            oldIndex !== undefined &&
            newIndex !== undefined
          ) {
            // 카드 이동
            moveCard(fromId, toId, oldIndex, newIndex)
          }
        },
      })

      sortables.push(sortable)
    })

    return () => sortables.forEach((s) => s.destroy())
  }, [activeBoard, moveCard])

  if (!activeBoard) return <div>Loading...</div>

  return (
    <div className="relative flex h-screen flex-col bg-white">
      {/* 헤더 */}
      <BoardHeader board={activeBoard} />

      {/* 보드 랜더링 */}
      <main className="relative flex-1 overflow-hidden">
        <BoardCanvas board={activeBoard} columnRefs={columnRefs} />

        {isSettingsOpen && <BoardSettings board={activeBoard} />}
      </main>

      {selectedCard && <CardDetailModal />}
    </div>
  )
}

export default BoardPage
