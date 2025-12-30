import {
  MessageSquare,
  ArrowRight,
  CheckSquare,
  Clock,
  Trash2,
  User,
  Paperclip,
  ArrowUpCircle,
  Archive,
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
import { useFileMutations } from '../../hooks/file/useFileMutations'
import { getDateStatusStyle } from '../../utils/dateUtils'
import { MAX_SIZE, ALLOWED_EXTENSIONS } from '../../constants/fileConstants'
import useBoardPermission from '../../hooks/board/useBoardPermission'

function CardSidebar({
  onAddChecklist,
  showChecklist,
  onToggleComment,
  showComment,
  onArchiveToggle,
}) {
  const { boardId } = useParams()
  const { selectedCard, closeCardModal } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { updateCard, moveCard, deleteCard } = useCardMutations(activeBoard?.id)
  const { canEdit, canDeleteCard } = useBoardPermission(activeBoard)

  // 파일 업로드 훅 사용
  const { uploadFile } = useFileMutations(Number(boardId))

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

  // -- 파일 인풋 Ref --
  const fileInputRef = useRef(null)

  // 날짜 스타일 및 라벨 계산
  const dateStatus = getDateStatusStyle(selectedCard?.dueDate)

  // 카드가 선택될 때마다 기존 설정된 날짜로 초기화
  useEffect(() => {
    // DB 저장: 2025-12-16 15:00:00(타임존 저장 x)
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date()

      // 2025-12-16T15:00:00로 변환
      let normalized = dateStr.replace(' ', 'T')

      // 2025-12-16T15:00:00Z로 변환
      if (!normalized.endsWith('Z') && !normalized.includes('+')) {
        normalized += 'Z'
      }

      // UTC 16일 15시 +9시간 -> 한국 시간 17일 00시로 변환
      return new Date(normalized)
    }

    if (selectedCard) {
      setDateRange([
        {
          startDate: selectedCard.startDate
            ? parseDate(selectedCard.startDate)
            : new Date(),
          endDate: selectedCard.dueDate
            ? parseDate(selectedCard.dueDate)
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

  // 권한이 없으면 메뉴를 열지 않도록 차단
  const handleMenuClick = (toggleFn) => {
    if (canEdit) toggleFn()
  }

  // 파일 선택 핸들러
  const handleFileClick = () => {
    if (canEdit && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 파일 업로드 핸들러
  const handleFileChange = (e) => {
    if (!canEdit) return

    const file = e.target.files?.[0]
    if (!file) return

    // 용량 체크
    if (file.size > MAX_SIZE) {
      alert('파일 크기는 5MB를 넘을 수 없습니다.')
      return
    }

    // 확장자 체크
    if (!ALLOWED_EXTENSIONS.includes(file.type)) {
      alert('지원하지 않은 파일 확장자입니다..')
      return
    }

    uploadFile({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      file: file,
    })

    // 같은 파일을 다시 선택해도 이벤트가 발생하도록 초기화
    e.target.value = ''
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
      // 시작일: 00시 00분 00초 (KST)
      const adjustedStartDate = new Date(startDate)
      adjustedStartDate.setHours(0, 0, 0, 0)

      // 마감일: 23시 59분 59초 (KST)
      const adjustedEndDate = new Date(endDate)
      adjustedEndDate.setHours(23, 59, 59, 999)

      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: {
          // UTC 기준으로 저장
          startDate: adjustedStartDate.toISOString(),
          dueDate: adjustedEndDate.toISOString(),
        },
      })
    }
    setIsDateOpen(false)
  }

  // 멤버 관련
  const assignableMembers =
    activeBoard.visibility === 'PUBLIC'
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
            onClick={() => handleMenuClick(toggleMemberMenu)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
              isMemberOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User size={16} className="text-gray-500" />
            <span className="text-gray-500">담당자</span>

            {/* 현재 담당자 뱃지 */}
            {selectedCard.assignee && (
              <span
                className={`ml-auto flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${
                  selectedCard.assignee.isAssigneeLeft
                    ? 'bg-gray-200 text-gray-500 opacity-70' // 탈퇴 시 스타일
                    : 'bg-blue-50 text-blue-600' // 일반 스타일
                }`}
              >
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
          <CardLabel handleMenuClick={handleMenuClick} />

          {/* 우선순위 컴포넌트 */}
          <CardPriority handleMenuClick={handleMenuClick} />

          {/* 마감일 버튼 */}
          <button
            ref={dateButtonRef}
            onClick={() => handleMenuClick(toggleDateMenu)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
              isDateOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={16} className="text-gray-500" />
            <span className="text-gray-500">마감일</span>

            {/* 3. 마감일이 설정되어 있다면 우측에 날짜 표시 */}
            {selectedCard?.dueDate && (
              <span
                className={`ml-auto rounded px-1.5 py-0.5 text-xs font-semibold ${dateStatus.bg} ${dateStatus.text}`}
              >
                {dateStatus.dateLabel}
              </span>
            )}
          </button>

          {/* 달력 메뉴 */}
          <DateRangePickerMenu
            isOpen={isDateOpen}
            onClose={() => setIsDateOpen(false)}
            range={dateRange}
            setRange={setDateRange}
            onApply={handleDateApply}
            position={datePopupPos}
            buttonRef={dateButtonRef}
          />

          {/* 첨부파일 버튼 */}
          <button
            onClick={handleFileClick}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} hover:bg-gray-200`}
          >
            <Paperclip size={16} className="text-gray-500" />
            <span className="text-gray-500">첨부파일</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 체크리스트 버튼 */}
          <button
            onClick={() => handleMenuClick(onAddChecklist)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
              showChecklist ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckSquare size={16} className="text-gray-500" />
            <span className="text-gray-500">체크리스트</span>
          </button>

          {/* 댓글 버튼 */}
          <button
            onClick={() => handleMenuClick(onToggleComment)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
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
        {!selectedCard.isComplete && canEdit && (
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
        {canEdit && (
          <button
            onClick={() => onArchiveToggle(!selectedCard.isArchived)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
          >
            {selectedCard.isArchived ? (
              <>
                <ArrowUpCircle size={16} className="text-blue-600" />
                <span>보드로 이동</span>
              </>
            ) : (
              <>
                <Archive size={16} className="text-orange-600" />
                <span>아카이브로 이동</span>
              </>
            )}
          </button>
        )}
        {canDeleteCard && (
          <button
            onClick={handleDeleteCard}
            className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:cursor-pointer hover:bg-red-100"
          >
            <Trash2 size={14} />
            <span>카드 삭제</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default CardSidebar
