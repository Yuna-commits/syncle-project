import { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Sortable from 'sortablejs'
import BoardCanvas from '../../components/board/BoardCanvas'
import BoardHeader from '../../components/board/BoardHeader'
import BoardSettings from '../../components/board/BoardSettings'
import CardDetailModal from '../../components/modals/board/CardDetailModal'
import useBoardPermission from '../../hooks/board/useBoardPermission'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import { useListMutations } from '../../hooks/useListMutations'
import useBoardStore from '../../stores/useBoardStore'
import { useBoardSocket } from '../../hooks/board/useBoardSocket'
import { useQueryClient } from '@tanstack/react-query'

const DONE_LIST_ID = 'virtual-done-list' // 완료 리스트 ID 상수 정의

/**
 * 보드 데이터 로딩,
 * 각 컴포넌트 배치 및 보드 데이터 전달
 */
function BoardPage() {
  // URL 파라미터 (/boards/{boardId})
  const { boardId: boardIdParam } = useParams()
  const boardId = Number(boardIdParam)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()
  const cardIdFromUrl = searchParams.get('cardId')

  const { selectedCard, isSettingsOpen, resetBoard, findAndSelectCard } =
    useBoardStore()

  // 데이터 조회는 React Query 훅 사용
  const { data: activeBoard, isLoading, error } = useBoardQuery(boardId)

  // 웹소켓 연결 및 실시간 감지
  useBoardSocket(boardId)

  // 데이터 변경
  const { moveCard } = useCardMutations(boardId)
  const { moveList } = useListMutations(boardId)

  // 권한 계산
  const { canEdit } = useBoardPermission(activeBoard)

  // 각 리스트(컬럼)의 DOM 요소를 참조하기 위한 Ref 객체
  const columnRefs = useRef({})

  // 리스트 컨테이너 Ref
  const listContainerRef = useRef(null)

  useEffect(() => {
    if (error) {
      const status = error.response?.status
      queryClient.invalidateQueries({ queryKey: ['myBoards'] }) // 내 보드 목록
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // 대시보드 전체
      queryClient.invalidateQueries({ queryKey: ['teams'] }) // 팀 목록
      if (status === 403) {
        alert('이 보드에 접근할 권한이 없습니다.')
      } else if (status === 404) {
        alert('존재하지 않거나 삭제된 보드입니다.')
      } else {
        alert('보드 정보를 불러오는데 실패했습니다.')
      }
      navigate('/dashboard', { replace: true })
    }
  }, [error, navigate])

  // 알림 페이지 -> 카드 상세 이동 시
  useEffect(() => {
    if (cardIdFromUrl && activeBoard) {
      findAndSelectCard(activeBoard, Number(cardIdFromUrl))
      setSearchParams({}, { replace: true })
    }
  }, [cardIdFromUrl, activeBoard, findAndSelectCard, setSearchParams])

  // 언마운트 시 스토어 초기화
  useEffect(() => {
    return () => {
      resetBoard()
      useBoardStore.setState({ selectedCard: null })
    }
  }, [resetBoard])

  // 리스트 이동 Sortable
  useEffect(() => {
    if (!activeBoard || !listContainerRef.current) return

    const listSortable = new Sortable(listContainerRef.current, {
      group: 'board-lists',
      direction: 'horizontal',
      animation: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      draggable: '.draggable-list',
      handle: '.board-list-header',
      ghostClass: 'opacity-50',
      disabled: !canEdit,

      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt
        if (
          oldIndex !== undefined &&
          newIndex !== undefined &&
          oldIndex !== newIndex
        ) {
          moveList({
            oldIndex,
            newIndex,
            currentOrder: activeBoard.columnOrder,
          })
        }
      },
    })

    return () => listSortable.destroy()
  }, [activeBoard, moveList, canEdit])

  // 카드 이동 Sortable
  useEffect(() => {
    if (!activeBoard) return

    const sortables = []
    const columns = activeBoard.columns || {}

    Object.keys(columns).forEach((colId) => {
      const el = columnRefs.current[colId]
      if (!el) return

      const isDoneList = colId === DONE_LIST_ID || columns[colId].isVirtual

      const sortable = new Sortable(el, {
        group: {
          name: 'kanban',
          put: !isDoneList,
        },
        animation: 150,
        ghostClass: 'opacity-50',
        sort: !isDoneList,
        disabled: !canEdit,

        onEnd: (evt) => {
          const fromId = evt.from.dataset.columnId
          const toId = evt.to.dataset.columnId
          const { newIndex } = evt
          const cardId = Number(evt.item.dataset.id)

          if (fromId && toId && cardId) {
            if (evt.from !== evt.to) {
              evt.from.appendChild(evt.item)
            }
            moveCard({ cardId, fromListId: fromId, toListId: toId, newIndex })
          }
        },
      })

      sortables.push(sortable)
    })

    return () => sortables.forEach((s) => s.destroy())
  }, [activeBoard, moveCard, canEdit])

  // 로딩 처리
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading board...
      </div>
    )

  if (error) return null

  // 데이터가 없을 때
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
          boardId={boardId}
        />
      </main>

      {isSettingsOpen && <BoardSettings board={activeBoard} />}
      {selectedCard && (
        <CardDetailModal board={activeBoard} boardId={boardId} />
      )}
    </div>
  )
}

export default BoardPage
