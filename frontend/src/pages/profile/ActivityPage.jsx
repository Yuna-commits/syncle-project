import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import SummaryItem from '../../components/activity_log/SummaryItem'
import BoardCard from '../../components/activity_log/BoardCard'
import DateRangePickerMenu from '../../components/modals/DateRangePickerMenu'
import useActivityStore from '../../stores/useActivityStore'
import ActivityLogItem from '../../components/activity_log/ActivityLogItem'

export default function ActivityPage() {
  const {
    stats,
    topBoards,
    logs,
    isLoading,
    filter,
    setFilter,
    fetchActivityData,
    reset,
  } = useActivityStore()

  // 날짜 범위 (전체 기간 → null)
  const [range, setLocalRange] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  // 마운트될 때마다 초기 데이터 로드 & 언마운트 시 리셋
  useEffect(() => {
    fetchActivityData()
    return () => reset()
  }, [fetchActivityData, reset])

  // 필터(타입, 날짜)가 바뀌면 데이터 다시 로드
  useEffect(() => {
    fetchActivityData()
  }, [filter.type, filter.startDate, filter.endDate, fetchActivityData])

  // 날짜 적용 핸들러 (적용 버튼 클릭 시 실행)
  const handleDateApply = (newRange) => {
    if (newRange && newRange[0]) {
      setFilter({
        startDate: format(newRange[0].startDate, 'yyyy-MM-dd'),
        endDate: format(newRange[0].endDate, 'yyyy-MM-dd'),
      })
    } else {
      setFilter({ startDate: null, endDate: null })
    }
  }

  // 검색어 엔터 처리
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchActivityData()
    }
  }

  if (isLoading && !logs.length && !topBoards.length) {
    return (
      <div className="p-20 text-center text-gray-500">
        데이터를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto max-w-5xl p-4 pb-20 md:p-6 md:pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">활동 내역</h2>
        <p className="mt-2 text-gray-500">
          나의 모든 활동 기록을 한눈에 확인하세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. 활동 요약 (Stats) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryItem label="생성 카드" value={stats.createdCards7} />
          <SummaryItem label="완료 작업" value={stats.completedTasks7} />
          <SummaryItem label="작성 댓글" value={stats.comments7} />
        </div>

        {/* 2. 인기 보드 (Top Boards) */}
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">
            가장 활발한 보드
          </h3>

          {topBoards.length > 0 ? (
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

        {/* 3. 타임라인 (Logs) */}
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="text-lg font-bold text-gray-900">타임라인</h3>

            {/* 필터링 도구 */}
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              {/* 검색 */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="내용 검색..."
                  value={filter.keyword}
                  onChange={(e) => setFilter({ keyword: e.target.value })}
                  onKeyDown={handleSearch}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:outline-none sm:w-48"
                />
                <svg
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* 날짜 선택 */}
              <div className="relative">
                <button
                  onClick={() => setOpenCalendar(!openCalendar)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
                >
                  <span>
                    {filter.startDate && filter.endDate
                      ? `${format(
                          new Date(filter.startDate),
                          'MM.dd',
                        )} ~ ${format(new Date(filter.endDate), 'MM.dd')}`
                      : '전체 기간'}
                  </span>
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <DateRangePickerMenu
                  isOpen={openCalendar}
                  onClose={() => setOpenCalendar(false)}
                  range={range}
                  setRange={setLocalRange}
                  onApply={handleDateApply}
                />
              </div>

              {/* 유형 필터 */}
              <select
                value={filter.type}
                onChange={(e) => setFilter({ type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:cursor-pointer focus:border-blue-500 focus:outline-none sm:w-auto"
              >
                <option value="all">모든 활동</option>
                <option value="CREATE_CARD">카드 생성</option>
                <option value="MOVE_CARD">카드 이동</option>
                <option value="CREATE_COMMENT">댓글 작성</option>
                <option value="UPDATE_CARD_STATUS">
                  카드 상태 변경 (완료)
                </option>
                <option value="UPDATE_CARD_DUE_DATE">마감일 변경</option>
                <option value="INVITE_MEMBER">멤버 초대</option>
              </select>
            </div>
          </div>

          {/* 로그 리스트 */}
          <div className="space-y-8">
            {logs.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">활동 내역이 없습니다.</p>
              </div>
            ) : (
              logs.map((group) => (
                <div
                  key={group.date}
                  className="relative border-l-2 border-gray-200 pl-4.5"
                >
                  {/* 날짜 헤더 */}
                  <div className="mb-4 flex items-center">
                    <div className="mr-4 -ml-[25px] h-3 w-3 rounded-full border border-gray-100 bg-gray-300 ring-4 ring-white"></div>
                    <h4 className="text-sm font-bold text-gray-500">
                      {group.date}
                    </h4>
                  </div>

                  {/* 로그 아이템 */}
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
