import {
  MessageSquare,
  ArrowRight,
  CheckSquare,
  Clock,
  Flag,
  Trash2,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import useBoardStore from '../../stores/useBoardStore'
import MoveColumnMenu from '../modals/board/MoveColumnMenu'
import DateRangePickerMenu from '../modals/DateRangePickerMenu'
import MemberPickerMenu from '../modals/MemberPickerMenu'
import { createPortal } from 'react-dom'
// 우선순위 옵션 상수 정의
const PRIORITY_OPTIONS = [
  {
    key: 'HIGH',
    label: '높음',
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    iconColor: 'text-red-500',
  },
  {
    key: 'MEDIUM',
    label: '보통',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    iconColor: 'text-orange-500',
  },
  {
    key: 'LOW',
    label: '낮음',
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    iconColor: 'text-green-500',
  },
]

function CardSidebar({
  onAddChecklist,
  showChecklist,
  onToggleComment,
  showComment,
}) {
  const { boardId } = useParams()
  const { selectedCard, closeCardModal } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { updateCard, moveCard, deleteCard } = useCardMutations(activeBoard?.id)

  // -- 날짜 메뉴 상태 --
  const [isDateOpen, setIsDateOpen] = useState(false)
  const dateButtonRef = useRef(null)
  // 팝업 위치 저장을 위한 상태
  const [datePopupPos, setDatePopupPos] = useState({ top: 0, left: 0 })
  // 달력 컴포넌트에 전달할 날짜 범위 상태
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ])

  // -- 담당자 메뉴 상태 --
  const [isMemberOpen, setIsMemberOpen] = useState(false)
  const memberButtonRef = useRef(null)
  const [memberPopupPos, setMemberPopupPos] = useState({ top: 0, left: 0 })

  // -- 우선순위 메뉴 상태 --
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const priorityButtonRef = useRef(null)
  const [priorityPopupPos, setPriorityPopupPos] = useState({ top: 0, left: 0 })

  // -- 이동 메뉴 상태 --
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const moveButtonRef = useRef(null)
  const [movePopupPos, setMovePopupPos] = useState({ top: 0, left: 0 })

  // 카드가 선택될 때마다 기존 설정된 날짜로 초기화
  useEffect(() => {
    if (selectedCard) {
      setDateRange([
        {
          startDate: selectedCard.startDate
            ? new Date(selectedCard.startDate)
            : new Date(),
          endDate: selectedCard.dueDate
            ? new Date(selectedCard.dueDate)
            : new Date(),
          key: 'selection',
        },
      ])
    }
  }, [selectedCard])

  // 날짜 메뉴 토글
  const toggleDateMenu = () => {
    if (!isDateOpen && dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect()
      setDatePopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isMemberOpen) setIsMemberOpen(false)
    if (isMoveOpen) setIsMoveOpen(false) // 다른 메뉴 닫기
    setIsDateOpen(!isDateOpen)
  }

  // 담당자 메뉴 토글
  const toggleMemberMenu = () => {
    if (!isMemberOpen && memberButtonRef.current) {
      const rect = memberButtonRef.current.getBoundingClientRect()
      setMemberPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isDateOpen) setIsDateOpen(false)
    if (isMoveOpen) setIsMoveOpen(false) // 다른 메뉴 닫기
    setIsMemberOpen(!isMemberOpen)
  }

  // 우선순위 메뉴 토글
  const togglePriorityMenu = () => {
    if (!isPriorityOpen && priorityButtonRef.current) {
      const rect = priorityButtonRef.current.getBoundingClientRect()
      setPriorityPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isDateOpen) setIsDateOpen(false)
    if (isMemberOpen) setIsMemberOpen(false)
    if (isMoveOpen) setIsMoveOpen(false)
    setIsPriorityOpen(!isPriorityOpen)
  }

  // 이동 메뉴 토글 함수
  const toggleMoveMenu = () => {
    if (!isMoveOpen && moveButtonRef.current) {
      const rect = moveButtonRef.current.getBoundingClientRect()
      setMovePopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isDateOpen) setIsDateOpen(false)
    if (isMemberOpen) setIsMemberOpen(false)
    setIsMoveOpen(!isMoveOpen)
  }

  // 날짜 적용 핸들러
  const handleDateApply = (item) => {
    if (!item) {
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: { startDate: null, dueDate: null, removeDate: true },
      })
    } else {
      const { startDate, endDate } = item[0]
      const adjustedStartDate = new Date(startDate)
      adjustedStartDate.setHours(12, 0, 0, 0)
      const adjustedEndDate = new Date(endDate)
      adjustedEndDate.setHours(12, 0, 0, 0)

      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: {
          startDate: adjustedStartDate.toISOString(),
          dueDate: adjustedEndDate.toISOString(),
        },
      })
    }
    setIsDateOpen(false)
  }

  // 멤버 관련
  const assignableMembers =
    activeBoard.visibility === 'TEAM'
      ? activeBoard.teamMembers
      : activeBoard.members

  const handleChangeMember = (member) => {
    if (selectedCard.assignee?.id === member.id) return
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        assigneeId: member.id,
        assigneeName: member.name,
        assigneeProfileImg: member.profileImg,
        assignee: member,
      },
    })
    setIsMemberOpen(false)
  }

  // 우선순위 변경 핸들러
  const handleUpdatePriority = (priorityKey) => {
    if (priorityKey === null) {
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: { priority: null, removePriority: true },
      })
    } else {
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: { priority: priorityKey },
      })
    }
    setIsPriorityOpen(false)
  }

  // 이동할 컬럼 목록 (가상 리스트 제외)
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns).filter((col) => !col.isVirtual)
    : []

  // 카드 이동 핸들러 (이벤트 객체 대신 ID를 받도록 수정됨)
  const handleMoveCard = (newColId) => {
    if (newColId && newColId !== selectedCard.listId) {
      const targetColumn = activeBoard.columns[newColId]
      const newIndex = targetColumn.tasks ? targetColumn.tasks.length : 0

      moveCard({
        cardId: selectedCard.id,
        fromListId: selectedCard.listId,
        toListId: newColId,
        newIndex,
      })
      setIsMoveOpen(false) // 이동 후 메뉴 닫기
    }
  }

  // 카드 삭제 핸들러
  const handleDeleteCard = () => {
    if (
      window.confirm(
        '정말 이 카드를 삭제하시겠습니까?\n삭제된 카드는 복구할 수 없습니다.',
      )
    ) {
      deleteCard(
        {
          cardId: selectedCard.id,
          listId: selectedCard.listId,
        },
        {
          onSuccess: () => {
            if (closeCardModal) closeCardModal()
          },
        },
      )
    }
  }

  // 현재 선택된 우선순위 정보 가져오기
  const currentPriority = PRIORITY_OPTIONS.find(
    (p) => p.key === selectedCard.priority,
  )

  return (
    <div className="w-full shrink-0 space-y-6 md:w-60">
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
            추가 요소
          </h4>
          {/* 담당자 버튼 */}
          <button
            ref={memberButtonRef}
            onClick={toggleMemberMenu}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              isMemberOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User size={16} className="text-gray-500" />
            <span className="text-gray-500">담당자</span>

            {/* 현재 담당자 이름 뱃지 */}
            {selectedCard.assignee && (
              <span className="ml-auto flex items-center gap-1.5 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                {selectedCard.assignee.name}
              </span>
            )}
          </button>

          {/* 담당자 선택 메뉴 */}
          <MemberPickerMenu
            isOpen={isMemberOpen}
            onClose={() => setIsMemberOpen(false)}
            position={memberPopupPos}
            members={assignableMembers} // 팀/보드 전체 멤버
            assignedMemberId={selectedCard?.assignee?.id} //현재 담당자
            onSelectMember={handleChangeMember}
          />

          {/* [수정] 우선순위 버튼 (기존 태그 버튼 대체) */}
          <button
            ref={priorityButtonRef}
            onClick={togglePriorityMenu}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              isPriorityOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Flag size={16} className="text-gray-500" />
            <span className="text-gray-500">우선순위</span>

            {/* 선택된 우선순위 뱃지 */}
            {currentPriority && (
              <span
                className={`ml-auto rounded px-2 py-0.5 text-xs font-semibold ${currentPriority.color}`}
              >
                {currentPriority.label}
              </span>
            )}
          </button>

          {/* [추가] 우선순위 선택 팝업 (Portal 사용) */}
          {isPriorityOpen &&
            createPortal(
              <div
                className="animate-in fade-in zoom-in-95 fixed z-50 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg duration-100"
                style={{
                  top: priorityPopupPos.top,
                  left: priorityPopupPos.left,
                }}
              >
                <div
                  className="fixed inset-0 -z-10"
                  onClick={() => setIsPriorityOpen(false)}
                />
                <div className="flex flex-col p-1">
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleUpdatePriority(option.key)}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer ${option.color}`}
                    >
                      <Flag size={14} className={option.iconColor} />
                      <span className="font-medium">{option.label}</span>
                      {selectedCard.priority === option.key && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                  {/* 우선순위 제거 옵션 */}
                  {selectedCard.priority && (
                    <button
                      onClick={() => handleUpdatePriority(null)}
                      className="mt-1 w-full rounded px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100"
                    >
                      제거
                    </button>
                  )}
                </div>
              </div>,
              document.body,
            )}

          {/* 마감일 버튼 */}
          <button
            ref={dateButtonRef}
            onClick={toggleDateMenu}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              isDateOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={16} className="text-gray-500" />
            <span className="text-gray-500">마감일</span>
          </button>

          {/* 달력 메뉴 */}
          <DateRangePickerMenu
            isOpen={isDateOpen}
            onClose={() => setIsDateOpen(false)}
            range={dateRange}
            setRange={setDateRange}
            onApply={handleDateApply}
            position={datePopupPos}
          />

          {/* 체크리스트 버튼 */}
          <button
            onClick={onAddChecklist}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              showChecklist ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckSquare size={16} className="text-gray-500" />
            <span className="text-gray-500">체크리스트</span>
          </button>

          {/* 댓글 버튼 */}
          <button
            onClick={onToggleComment}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              showComment ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={16} className="text-gray-500" />
            <span className="text-gray-500">댓글</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* 완료된 카드가 아닐 때만 '이동' 섹션 표시 */}
        {!selectedCard.isComplete && (
          <>
            <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              작업
            </h4>

            <button
              ref={moveButtonRef}
              onClick={toggleMoveMenu}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
                isMoveOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowRight size={16} className="text-gray-500" />
              <span className="text-gray-500">다른 리스트로 이동</span>
            </button>

            {/* 이동 메뉴 컴포넌트 연결 */}
            <MoveColumnMenu
              isOpen={isMoveOpen}
              onClose={() => setIsMoveOpen(false)}
              position={movePopupPos}
              columns={allColumns}
              currentListId={selectedCard.listId}
              onSelectColumn={handleMoveCard}
            />
          </>
        )}
        <button
          onClick={handleDeleteCard}
          className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:cursor-pointer hover:bg-red-100"
        >
          <Trash2 size={14} />
          <span>휴지통</span>
        </button>
      </div>
    </div>
  )
}

export default CardSidebar
