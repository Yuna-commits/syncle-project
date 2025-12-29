import React, { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import SummaryItem from '../../components/activity_log/SummaryItem'
import BoardCard from '../../components/activity_log/BoardCard'
import DateRangePickerMenu from '../../components/modals/DateRangePickerMenu'
import ActivityLogItem from '../../components/activity_log/ActivityLogItem'
import useActivityFilterStore from '../../stores/useActivityFilterStore'
import {
  useActivityStats,
  useInfiniteActivityLogs,
} from '../../hooks/useActivityQuery'
import {
  CalendarIcon,
  ChevronDown,
  Filter,
  Inbox,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react'

const ACTIVITY_TYPE_GROUPS = [
  {
    label: '카드 활동',
    options: [
      { value: 'CREATE_CARD', label: '카드 생성' },
      { value: 'UPDATE_CARD', label: '카드 수정/이동' },
      { value: 'ADD_COMMENT', label: '댓글 작성' },
      { value: 'CHECKLIST_COMPLETED', label: '체크리스트 완료' },
    ],
  },
  {
    label: '보드 관리',
    options: [
      { value: 'CREATE_BOARD', label: '보드 생성' },
      { value: 'UPDATE_BOARD', label: '보드 정보 변경' },
      { value: 'UPDATE_BOARD_SETTINGS', label: '보드 설정 변경' },
      { value: 'DELETE_BOARD', label: '보드 삭제' },
      { value: 'CREATE_LIST', label: '리스트 생성' },
      { value: 'UPDATE_LIST', label: '리스트 수정' },
      { value: 'DELETE_LIST', label: '리스트 삭제' },
    ],
  },
  {
    label: '팀 관리',
    options: [
      { value: 'CREATE_TEAM', label: '팀 생성' },
      { value: 'UPDATE_TEAM', label: '팀 정보 변경' },
      { value: 'DELETE_TEAM', label: '팀 삭제' },
    ],
  },
  {
    label: '멤버 및 권한',
    options: [
      { value: 'INVITE_MEMBER', label: '멤버 초대' },
      { value: 'UPDATE_MEMBER_ROLE', label: '권한 변경' },
      { value: 'KICK_MEMBER', label: '멤버 내보내기' },
      { value: 'ACCEPT_INVITE', label: '초대 수락' },
      { value: 'LEAVE_BOARD', label: '보드/팀 탈퇴' },
    ],
  },
]

export default function ActivityPage() {
  // 필터 상태 관리
  const { filter, setFilter, reset } = useActivityFilterStore()

  const [localKeyword, setLocalKeyword] = useState(filter.keyword || '')

  // 엔터 키 감지 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setFilter({ keyword: localKeyword }) // 엔터 누르면 store 업데이트 -> API 호출
    }
  }

  // 통계 데이터
  const {
    data: dashboardData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useActivityStats()

  const stats = dashboardData?.stats || {
    createdCards7: 0,
    completedTasks7: 0,
    comments7: 0,
  }
  const topBoards = dashboardData?.topBoards || []

  // 로그 데이터
  const {
    data: groupedLogs, // select 옵션을 통해 이미 날짜별로 그룹화된 데이터가 들어옴
    fetchNextPage, // 다음 페이지 불러오기 함수
    hasNextPage, // 더 불러올 데이터가 있는지 여부
    isFetchingNextPage, // 추가 데이터 로딩 중인지 여부
    isLoading: isLogsLoading,
    isError,
    refetch: refetchLogs,
  } = useInfiniteActivityLogs()

  // 언마운트 시 필터 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  // 새로고침
  const handleRefresh = () => {
    refetchStats()
    refetchLogs()
  }

  // 날짜 범위 (전체 기간 → null)
  const [range, setLocalRange] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  // 달력 버튼 위치 참조용
  const calendarButtonRef = useRef(null)
  // 메뉴 위치 상태
  const [calendarPos, setCalendarPos] = useState({ top: 0, right: 0 })

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
      const { startDate, endDate } = newRange[0]

      // 시작일: 00시 00분 00초 (KST)
      const adjustedStartDate = new Date(startDate)
      adjustedStartDate.setHours(0, 0, 0, 0)

      // 종료일: 23시 59분 59초 (KST)
      const adjustedEndDate = new Date(endDate)
      adjustedEndDate.setHours(23, 59, 59, 999)

      setFilter({
        // format 함수가 로컬 시간 기준 'yyyy-MM-dd' 문자열 생성
        startDate: format(adjustedStartDate, 'yyyy-MM-dd'),
        endDate: format(adjustedEndDate, 'yyyy-MM-dd'),
      })

      setLocalRange(newRange)
    } else {
      setFilter({ startDate: null, endDate: null })
      setLocalRange(null)
    }
    setOpenCalendar(false)
  }

  // 초기 전체 로딩 (통계나 첫 로그가 로딩 중일 때)
  const isPageLoading = isStatsLoading || (isLogsLoading && !groupedLogs)

  if (isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={24} />
        <span>데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 p-8 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">활동 내역</h1>
          <p className="mt-2 text-gray-500">
            최근 활동과 통계를 한눈에 확인하세요.
          </p>
        </div>
        <button
          onClick={() => handleRefresh}
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
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {localKeyword && (
                <button
                  onClick={() => {
                    setLocalKeyword('') // 1. 입력창 비우기
                    setFilter({ keyword: '' }) // 2. 즉시 필터 초기화 및 재조회 요청
                  }}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 유형 필터 */}
              <div className="relative">
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ type: e.target.value })}
                  className="appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2 pr-8 pl-3 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALL">모든 활동</option>

                  {ACTIVITY_TYPE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
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
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
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
                  buttonRef={calendarButtonRef}
                />
              </div>
            </div>
          </div>

          {/* 로그 리스트 */}
          <div
            className={`min-h-[400px] rounded-2xl border border-gray-300 bg-white p-6 shadow-sm`}
          >
            {isError ? (
              <div className="flex h-64 items-center justify-center text-red-500">
                데이터를 불러오지 못했습니다.
              </div>
            ) : !groupedLogs || groupedLogs.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Inbox size={24} />
                </div>
                <p className="text-gray-500">활동 내역이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 날짜별 그룹 렌더링 */}
                {groupedLogs.map((group) => (
                  <div
                    key={group.date}
                    className="relative mb-6 border-l-2 border-gray-300 pl-4.5 last:mb-0"
                  >
                    <div className="mb-4 flex items-center">
                      <div className="mr-4 -ml-[25px] h-3 w-3 rounded-full border border-gray-100 bg-gray-300 ring-4 ring-white"></div>
                      <h4 className="text-sm font-bold text-gray-500">
                        {group.date}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {group.logs.map((item) => (
                        <ActivityLogItem
                          key={item.id}
                          log={item}
                          variant="timeline"
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* 더보기 버튼 (페이지네이션) */}
                {hasNextPage && (
                  <div className="mt-8 flex justify-center pb-4">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          불러오는 중...
                        </>
                      ) : (
                        <>
                          <ChevronDown
                            size={16}
                            className="transition-transform group-hover:translate-y-0.5"
                          />
                          더 보기
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
