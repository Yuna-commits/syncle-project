import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar as CalendarIcon } from 'lucide-react'
import '../../calendar.css'
// Hooks
import { useTeamQuery } from '../../hooks/team/useTeamQuery'
import { useMyBoardsQuery } from '../../hooks/board/useBoardQuery'
import { useCalendarEventsQuery } from '../../hooks/calendar/useCalendarQuery'
import CustomSelect from '../../components/common/CustomSelect'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useNavigate } from 'react-router-dom'

function CalendarPage() {
  const navigate = useNavigate()

  // --- 상태 관리 ---
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedBoardId, setSelectedBoardId] = useState('')
  const [onlyMyCards, setOnlyMyCards] = useState(false)

  // 로그인 유저 정보
  const { data: user } = useAuthQuery()

  // --- 데이터 조회 (Hooks 사용) ---
  const { data: teams = [] } = useTeamQuery()
  const { data: allBoards = [] } = useMyBoardsQuery()
  const { data: events = [] } = useCalendarEventsQuery({
    teamId: selectedTeamId,
    boardId: selectedBoardId,
  })

  // 내 담당 카드 로직
  const filteredEvents = useMemo(() => {
    if (!onlyMyCards) return events
    if (!user?.id) return []

    return events.filter((e) => e.extendedProps?.assigneeId === user.id)
  }, [events, onlyMyCards, user])

  // 필터링된 보드 목록
  const filteredBoards = useMemo(() => {
    if (!selectedTeamId) return allBoards
    return allBoards.filter((b) => String(b.teamId) === String(selectedTeamId))
  }, [selectedTeamId, allBoards])

  const teamOptions = useMemo(
    () => teams.map((t) => ({ value: t.id, label: t.name })),
    [teams],
  )
  const boardOptions = useMemo(
    () => filteredBoards.map((b) => ({ value: b.id, label: b.title })),
    [filteredBoards],
  )

  // --- 렌더링 헬퍼 함수 ---
  const renderEventContent = (eventInfo) => {
    const { isComplete, hasLabel } = eventInfo.event.extendedProps
    const containerClasses = hasLabel ? 'text-white' : 'text-gray-900 '
    const textDecorationClass = isComplete ? 'line-through' : ''

    return (
      <div
        className={`flex w-full items-center overflow-hidden px-1 py-0.5 ${containerClasses}`}
      >
        <div className={`truncate text-xs font-medium ${textDecorationClass}`}>
          {eventInfo.event.title}
        </div>
      </div>
    )
  }

  // --- 핸들러 ---
  const handleEventClick = (info) => {
    const { boardId, cardId } = info.event.extendedProps
    navigate(`/board/${boardId}/card/${cardId}`)
  }

  const handleTeamChange = (newTeamId) => {
    setSelectedTeamId(newTeamId)
    setSelectedBoardId('')
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white px-6 py-1">
      <div className="mx-auto flex h-full w-full flex-col gap-4">
        {/* --- 헤더 및 필터 --- */}
        <div className="flex flex-col justify-between gap-4 px-2 pb-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 shadow-sm ring-1 ring-gray-200">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
              <p className="text-sm text-gray-500">
                나에게 할당된 일정을 모아보세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* --- 필터 영역 --- */}
            <div className="flex items-center gap-3">
              <CustomSelect
                options={teamOptions}
                value={selectedTeamId}
                onChange={handleTeamChange}
                placeholder="모든 팀"
              />

              <CustomSelect
                options={boardOptions}
                value={selectedBoardId}
                onChange={setSelectedBoardId}
                placeholder={!selectedTeamId ? '팀 선택 필요' : '모든 보드'}
                disabled={!selectedTeamId}
              />

              {/* [내 담당만 보기] 체크박스 */}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={onlyMyCards}
                  onChange={(e) => setOnlyMyCards(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700 select-none">
                  내 담당만 보기
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* --- 캘린더 --- */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{ today: 'today', month: '월', week: '주', day: '일' }}
            locale="ko"
            initialView="dayGridMonth"
            events={filteredEvents}
            editable={false}
            selectable={true}
            dayMaxEvents={false}
            height="auto"
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>
      </div>
    </main>
  )
}

export default CalendarPage
