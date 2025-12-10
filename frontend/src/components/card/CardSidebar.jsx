import { ArrowRight, CheckSquare, Clock, Tag, Trash2, User } from 'lucide-react'
import useBoardStore from '../../stores/useBoardStore'
import DateRangePickerMenu from '../modals/DateRangePickerMenu'
import { useEffect, useRef, useState } from 'react'
import MemberPickerMenu from '../modals/MemberPickerMenu'
import { useCardMutations } from '../../hooks/useCardMutations'

function CardSidebar({ onAddChecklist, showChecklist }) {
  const { activeBoard, selectedCard } = useBoardStore()
  const { updateCard, moveCard } = useCardMutations(activeBoard?.id)

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

  // 버튼 클릭 시 좌표 계산 및 토글 함수
  const toggleDateMenu = () => {
    if (!isDateOpen && dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect()
      // 버튼 바로 아래(bottom), 왼쪽 정렬(left) 좌표 저장
      setDatePopupPos({
        top: rect.bottom + 8, // 약간의 여백
        left: rect.left,
      })
    }
    // 담당자 메뉴가 열려있으면 닫기
    if (isMemberOpen) setIsDateOpen(false)
    setIsDateOpen(!isDateOpen)
  }

  // 날짜 적용 핸들러 (API 호출)
  const handleDateApply = (item) => {
    if (!item) {
      // 초기화 버튼 클릭 시 (날짜 삭제)
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: {
          startDate: null,
          dueDate: null,
          removeDate: true,
        },
      })
    } else {
      // 날짜 선택 시
      const { startDate, endDate } = item[0]
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: {
          startDate: startDate.toISOString(),
          dueDate: endDate.toISOString(),
        },
      })
    }
    setIsDateOpen(false)
  }

  // 멤버 목록
  const assignableMembers =
    activeBoard.visibility === 'TEAM'
      ? activeBoard.teamMembers
      : activeBoard.members

  // 담당자 메뉴 토글
  const toggleMemberMenu = () => {
    if (!isMemberOpen && memberButtonRef.current) {
      const rect = memberButtonRef.current.getBoundingClientRect()
      setMemberPopupPos({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }
    // 날짜 메뉴가 열려있으면 닫기 (겹침 방지)
    if (isDateOpen) setIsDateOpen(false)
    setIsMemberOpen(!isMemberOpen)
  }

  // 담당자 변경 핸들러
  const handleChangeMember = (member) => {
    // 이미 담당자라면 변경 x
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

  // 모든 컬럼 목록 (이동 옵션용)
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns)
    : []

  // 카드 이동 핸들러
  const handleMoveCard = (e) => {
    const newColId = Number(e.target.value) || e.target.value
    if (newColId && newColId !== selectedCard.listId) {
      const targetColumn = activeBoard.columns[newColId]
      const newIndex = targetColumn.tasks ? targetColumn.tasks.length : 0

      moveCard({
        cardId: selectedCard.id,
        fromListId: selectedCard.listId,
        toListId: newColId,
        newIndex,
      })
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

          {/* 태그 버튼 */}
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200">
            <Tag size={16} className="text-gray-500" />
            <span className="text-gray-500">태그</span>
          </button>

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
          <button
            onClick={onAddChecklist}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
              showChecklist ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckSquare size={16} className="text-gray-500" />
            <span className="text-gray-500">체크리스트</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* 완료된 카드가 아닐 때만 '이동' 섹션 표시 */}
        {!selectedCard.isComplete && (
          <>
            <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              이동
            </h4>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-500">
                <ArrowRight size={14} />
              </div>
              <select
                className="w-full cursor-pointer appearance-none rounded-md bg-gray-50 py-1.5 pr-2 pl-8 text-sm text-gray-500 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedCard.listId}
                onChange={handleMoveCard}
              >
                {allColumns.map(
                  (col) =>
                    // 가상 리스트는 이동 대상 목록에서 제외
                    !col.isVirtual && (
                      <option key={col.id} value={col.id}>
                        {col.title}로 옮기기
                      </option>
                    ),
                )}
              </select>
            </div>
          </>
        )}
        <button className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:cursor-pointer hover:bg-red-100">
          <Trash2 size={14} />
          <span>휴지통</span>
        </button>
      </div>
    </div>
  )
}

export default CardSidebar
