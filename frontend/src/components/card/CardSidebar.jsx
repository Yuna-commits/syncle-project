import {
  MessageSquare,
  ArrowRight,
  CheckSquare,
  Clock,
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
import CardPriority from './CardPriority'
import CardLabel from './CardLabel'

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
  const [datePopupPos, setDatePopupPos] = useState({ top: 0, left: 0 })
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

  // 마감일 메뉴 토글
  const toggleDateMenu = () => {
    if (!isDateOpen && dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect()
      setDatePopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isMemberOpen) setIsMemberOpen(false)
    if (isMoveOpen) setIsMoveOpen(false)
    setIsDateOpen(!isDateOpen)
  }

  // 담당자 메뉴 토글
  const toggleMemberMenu = () => {
    if (!isMemberOpen && memberButtonRef.current) {
      const rect = memberButtonRef.current.getBoundingClientRect()
      setMemberPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    if (isDateOpen) setIsDateOpen(false)
    if (isMoveOpen) setIsMoveOpen(false)
    setIsMemberOpen(!isMemberOpen)
  }

  // 이동 메뉴 토글
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

  // 이동할 컬럼 목록
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns).filter((col) => !col.isVirtual)
    : []

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
      setIsMoveOpen(false)
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

            {/* 현재 담당자 뱃지 */}
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
            members={assignableMembers}
            assignedMemberId={selectedCard?.assignee?.id}
            onSelectMember={handleChangeMember}
          />

          {/* 라벨 컴포넌트 */}
          <CardLabel />

          {/* 우선순위 컴포넌트 */}
          <CardPriority />

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
        {/* 이동 및 삭제 섹션 */}
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
