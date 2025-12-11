import React, { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import SummaryItem from '../../components/activity_log/SummaryItem'
import BoardCard from '../../components/activity_log/BoardCard'
import DateRangePickerMenu from '../../components/modals/DateRangePickerMenu'
import ActivityLogItem from '../../components/activity_log/ActivityLogItem'
import useActivityFilterStore from '../../stores/useActivityFilterStore'
import { useActivityQuery } from '../../hooks/useActivityQuery'
import { CalendarIcon, Filter, Inbox, RefreshCcw, Search } from 'lucide-react'

export default function ActivityPage() {
  // 필터 상태 관리
  const { filter, setFilter, reset } = useActivityFilterStore()

  // 데이터 조회
  const { data, isLoading, error, refetch } = useActivityQuery()
  const { stats, topBoards, logs } = data || {
    stats: { createdCards7: 0, completedTasks7: 0, comments7: 0 },
    topBoards: [],
    logs: [],
  }

  // 날짜 범위 (전체 기간 → null)
  const [range, setLocalRange] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  // 달력 버튼 위치 참조용
  const calendarButtonRef = useRef(null)
  // 메뉴 위치 상태
  const [calendarPos, setCalendarPos] = useState({ top: 0, right: 0 })

  // 언마운트 시 필터 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  // 달력 토글 핸들러
  const toggleCalendar = () => {
    if (!openCalendar && calendarButtonRef.current) {
      const rect = calendarButtonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const modalHeight = 400 // 예상 높이

      // 1. 세로 위치 (Top)
      // 아래 공간 부족 시 위로 띄우기
      let top = rect.bottom + 8
      if (top + modalHeight > windowHeight) {
        top = rect.top - modalHeight - 8
      }

      // 2. 가로 위치 (Right Align)
      // 화면 전체 너비 - 버튼의 오른쪽 좌표 = 화면 오른쪽 끝에서의 거리
      const right = windowWidth - rect.right

      setCalendarPos({ top, right })
    }
    setOpenCalendar(!openCalendar)
  }

  // 날짜 적용 핸들러 (적용 버튼 클릭 시 실행)
  const handleDateApply = (newRange) => {
    if (newRange && newRange[0].startDate && newRange[0].endDate) {
      setFilter({
        startDate: format(newRange[0].startDate, 'yyyy-MM-dd'),
        endDate: format(newRange[0].endDate, 'yyyy-MM-dd'),
      })
      setLocalRange(newRange)
    } else {
      setFilter({ startDate: null, endDate: null })
      setLocalRange(null)
    }
    setOpenCalendar(false)
  }

  // 검색어 엔터 처리
  const handleSearch = (e) => {
    setFilter({ keyword: e.target.value })
  }

  if (isLoading && !logs.length && !topBoards.length) {
    return (
      <div className="p-20 text-center text-gray-500">
        데이터를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 p-8 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">활동 내역</h1>
          <p className="mt-1 text-gray-500">
            최근 활동과 통계를 한눈에 확인하세요.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border-b border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <RefreshCcw size={16} />
          새로고침
        </button>
      </div>

      {/* 1. 요약 통계 (최근 7일) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryItem label="생성한 카드" value={stats.createdCards7} />
        <SummaryItem label="완료한 작업" value={stats.completedTasks7} />
        <SummaryItem label="작성한 댓글" value={stats.comments7} />
      </div>

      <div className="flex flex-col gap-8">
        {/* 2. 자주 찾는 보드 섹션 */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              가장 활발한 보드
            </h3>
            {topBoards && topBoards.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {topBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
                최근 활동한 보드가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 활동 로그 (필터 + 리스트) */}
        <div className="space-y-6">
          {/* 필터 바 */}
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* 검색창 */}
            <div className="relative w-full sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="활동 검색..."
                value={filter.keyword || ''}
                onChange={handleSearch}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* 유형 필터 - 수정 필요!!! */}
              <div className="relative">
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ type: e.target.value })}
                  className="appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2 pr-8 pl-3 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">모든 활동</option>
                  <option value="card_create">카드 생성</option>
                  <option value="card_update">카드 수정</option>
                  <option value="comment">댓글</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <Filter size={14} />
                </div>
              </div>

              {/* 날짜 필터 */}
              <div className="relative">
                <button
                  ref={calendarButtonRef}
                  onClick={toggleCalendar}
                  className={`flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer hover:bg-gray-200 ${
                    filter.startDate
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CalendarIcon size={16} />
                  <span>
                    {filter.startDate ? `${filter.startDate} ~` : '전체 기간'}
                  </span>
                </button>

                {/* 캘린더 팝업 */}
                <DateRangePickerMenu
                  isOpen={openCalendar}
                  onClose={() => setOpenCalendar(false)}
                  range={range}
                  setRange={setLocalRange}
                  onApply={handleDateApply}
                  position={calendarPos}
                />
              </div>
            </div>
          </div>

          {/* 로그 리스트 - 로그 저장 방식 수정 필요!!! */}
          <div
            className={`rounded-2xl border border-gray-300 bg-white p-6 shadow-sm ${
              isLoading || error || logs.length === 0 ? 'min-h-[400px]' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-red-500">
                데이터를 불러오지 못했습니다.
              </div>
            ) : logs.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Inbox size={24} />
                </div>
                <p className="text-gray-500">활동 내역이 없습니다.</p>
              </div>
            ) : (
              logs.map((group) => (
                <div
                  key={group.date}
                  className="relative mb-6 border-l-2 border-gray-300 pl-4.5 last:mb-0 hover:cursor-pointer"
                >
                  <div className="mb-4 flex items-center">
                    <div className="mr-4 -ml-[25px] h-3 w-3 rounded-full border border-gray-100 bg-gray-300 ring-4 ring-white"></div>
                    <h4 className="text-sm font-bold text-gray-500">
                      {group.date}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {group.logs.map((item) => (
                      <ActivityLogItem key={item.id} log={item} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
