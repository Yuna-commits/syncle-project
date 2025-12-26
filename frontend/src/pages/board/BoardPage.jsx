import { useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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

const DONE_LIST_ID = 'virtual-done-list' // 완료 리스트 ID 상수 정의

/**
 * 보드 데이터 로딩,
 * 각 컴포넌트 배치 및 보드 데이터 전달
 */
function BoardPage() {
  // URL 파라미터 (/boards/{boardId})
  const { boardId: boardIdParam } = useParams()
  const boardId = Number(boardIdParam)

  const [searchParams, setSearchParams] = useSearchParams()
  const cardIdFromUrl = searchParams.get('cardId')

  const { selectedCard, isSettingsOpen, resetBoard, findAndSelectCard } =
    useBoardStore()

  // 데이터 조회는 React Query 훅 사용
  const { data: activeBoard, isLoading, error } = useBoardQuery(boardId)

  // 웹소켓 연결 및 실시간 감지
  // 이 Hook만 호출해두면, 내부에서 메시지를 받을 때마다 useBoardQuery를 자동으로 갱신(Refetch)합니다.
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

  // 알림 페이지 -> 카드 상세 이동 시
  // url에 cardId가 있고 보드 데이터가 로드되면 모달도 함께 열기
  useEffect(() => {
    if (cardIdFromUrl && activeBoard) {
      // 카드 모달 열기
      findAndSelectCard(activeBoard, Number(cardIdFromUrl))
      // URL 파라미터 제거 (replac: true로 무한 루프 제거)
      setSearchParams({}, { replace: true })
    }
  }, [cardIdFromUrl, activeBoard, findAndSelectCard, setSearchParams])

  // 4. 언마운트 시 스토어 초기화
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
      group: 'board-lists', // 카드와 다른 그룹명
      direction: 'horizontal', // 가로 방향 정렬
      animation: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      // .draggable-list 클래스가 있는 요소만 드래그/정렬 가능
      draggable: '.draggable-list',

      // 리스트 헤더(.board-list-header)를 잡았을 때만 드래그 가능
      handle: '.board-list-header',

      // 스타일 (필요시 index.css에 정의하여 사용 가능)
      ghostClass: 'opacity-50',
      disabled: !canEdit, // VIEWER는 리스트 이동 권한이 없음

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

      // 현재 컬럼이 완료 리스트인지 확인
      const isDoneList = colId === DONE_LIST_ID || columns[colId].isVirtual

      const sortable = new Sortable(el, {
        group: {
          name: 'kanban',
          put: !isDoneList,
        },
        animation: 150,
        ghostClass: 'opacity-50',
        sort: !isDoneList,
        disabled: !canEdit, // VIEWER는 카드 이동 권한이 없음

        onEnd: (evt) => {
          const fromId = evt.from.dataset.columnId
          const toId = evt.to.dataset.columnId
          const { newIndex } = evt
          const cardId = Number(evt.item.dataset.id)

          if (fromId && toId && cardId) {
            // DOM 조작: React가 다시 렌더링하기 전에 깜빡임 방지용 (Sortablejs 특성)
            if (evt.from !== evt.to) {
              evt.from.appendChild(evt.item)
            }

            // React 상태 업데이트
            moveCard({ cardId, fromListId: fromId, toListId: toId, newIndex })
          }
        },
      })

      sortables.push(sortable)
    })

    return () => sortables.forEach((s) => s.destroy())
  }, [activeBoard, moveCard, canEdit])

  // 로딩 및 에러 처리
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading board...
      </div>
    )

  // React Query의 error 객체는 message 속성을 가질 수 있음
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error.message || '보드를 불러오는 중 에러가 발생했습니다.'}
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
