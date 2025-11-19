import React, { useState } from 'react'
import { format } from 'date-fns'
import SummaryItem from '../../components/profile/SummaryItem'
import BoardCard from '../../components/profile/BoardCard'
import DateRangePickerMenu from '../../components/modals/DateRangePickerMenu'

export default function ActivityPage() {
  // 임시 활동 요약 데이터 (최근 7일)
  const summary = {
    createdCards7: 3,
    completedTasks7: 12,
    comments7: 5,
  }

  // 임시 인기 보드 데이터
  const topBoards = [
    {
      id: 1,
      title: '프로젝트 Alpha',
      description: '웹 대시보드 UI/UX 개선 프로젝트',
      activityCount: 24,
      created_at: '2025-10-03',
    },
    {
      id: 2,
      title: 'Mobile App 리뉴얼',
      description: '모바일 앱 화면 구조 리뉴얼',
      activityCount: 19,
      created_at: '2025-09-20',
    },
    {
      id: 3,
      title: '팀 운영 보드',
      description: '팀 일정 및 작업을 논의하는 운영 보드',
      activityCount: 17,
      created_at: '2025-08-12',
    },
  ]

  // 임시 로그 데이터
  const allLogs = [
    {
      date: '2025/11/18',
      logs: [
        {
          type: 'comment',
          title: '댓글 작성',
          desc: '"홈페이지 리디자인" 카드에 댓글을 남겼습니다.',
          target: '홈페이지 리디자인',
          board: '프로젝트 Alpha',
        },
        {
          type: 'move',
          title: '카드 이동',
          desc: '"UI 디자인"을 To Do → Doing으로 이동했습니다.',
          target: 'UI 디자인',
          board: '디자인 팀 보드',
        },
      ],
    },
    {
      date: '2025/11/14',
      logs: [
        {
          type: 'create',
          title: '카드 생성',
          desc: '"백엔드 API 설계" 카드를 생성했습니다.',
          target: '백엔드 API 설계',
          board: '웹 리뉴얼',
        },
      ],
    },
  ]

  // 필터 상태
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchText, setSearchText] = useState('')

  // 날짜 범위 (전체 기간 → null)
  const [range, setRange] = useState(null)
  const [openCalendar, setOpenCalendar] = useState(false)

  const fromDate = range?.[0].startDate
  const toDate = range?.[0].endDate

  // 필터링
  const filteredLogs = allLogs
    .map((group) => {
      const logDate = new Date(group.date)

      const logs = group.logs.filter((log) => {
        const textMatch = log.desc
          .toLowerCase()
          .includes(searchText.toLowerCase())
        const typeMatch = typeFilter === 'all' || log.type === typeFilter

        const dateMatch =
          !range ||
          (logDate >= new Date(fromDate.setHours(0, 0, 0)) &&
            logDate <= new Date(toDate.setHours(23, 59, 59)))

        return textMatch && typeMatch && dateMatch
      })

      return { ...group, logs }
    })
    .filter((g) => g.logs.length > 0)

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) p-4 pb-20 md:p-6 md:pb-24">
      <div className="rounded-2xl border border-gray-300 bg-white p-5 lg:p-6">
        <h3 className="mb-5 text-xl font-semibold text-gray-800 lg:mb-7">
          활동 내역
        </h3>

        <div className="space-y-6">
          {/* 1) 최근 7일 활동 */}
          <div className="rounded-2xl border border-gray-300 p-5">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">
              최근 7일 활동
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SummaryItem label="카드 생성" value={summary.createdCards7} />
              <SummaryItem
                label="완료한 작업"
                value={summary.completedTasks7}
              />
              <SummaryItem label="댓글" value={summary.comments7} />
            </div>
          </div>

          {/* 2) 활동이 많은 보드 */}
          <div className="rounded-2xl border border-gray-300 p-5">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">
              활동이 많은 보드
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}

              {/* 빈 공간 */}
              {topBoards.length < 3 &&
                Array.from({ length: 3 - topBoards.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="rounded-xl border border-dashed border-gray-200 bg-gray-50"
                  ></div>
                ))}
            </div>
          </div>

          {/* 3) 타임라인 */}
          <div className="rounded-2xl border border-gray-300 p-5">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">
              타임라인
            </h4>

            {/* 필터 바 */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              {/* 검색 */}
              <input
                type="text"
                placeholder="검색어를 입력해 주세요."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm md:w-1/3"
              />

              <div className="relative flex items-center gap-3">
                {/* 날짜 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenCalendar(!openCalendar)
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-100"
                >
                  {range
                    ? `${format(range[0].startDate, 'yyyy-MM-dd')} ~ ${format(
                        range[0].endDate,
                        'yyyy-MM-dd',
                      )}`
                    : '전체 기간'}
                </button>

                {/* 활동 유형 */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:cursor-pointer"
                >
                  <option value="all">전체</option>
                  <option value="comment">댓글</option>
                  <option value="move">카드 이동</option>
                  <option value="create">카드 생성</option>
                </select>

                {/* 달력 모달 */}
                <DateRangePickerMenu
                  isOpen={openCalendar}
                  onClose={() => setOpenCalendar(false)}
                  range={range}
                  setRange={setRange}
                  align="right"
                />
              </div>
            </div>

            {/* 타임라인 목록 */}
            <div className="space-y-8">
              {filteredLogs.length === 0 && (
                <p className="py-20 text-center text-sm text-gray-500">
                  활동이 없습니다.
                  <br />
                  보드에 참여하거나 카드를 작성해보세요!
                </p>
              )}

              {filteredLogs.map((group, idx) => (
                <div key={idx}>
                  <h4 className="mb-4 text-sm font-semibold text-gray-600">
                    {group.date}
                  </h4>

                  <div className="space-y-3">
                    {group.logs.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => console.log('로그 클릭')}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 transition hover:cursor-pointer hover:bg-gray-100 hover:shadow-sm"
                      >
                        <div className="font-semibold">
                          {item.title} —{' '}
                          <span className="text-blue-600">{item.target}</span>
                        </div>
                        <div className="mt-1 text-gray-600">{item.desc}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          보드: {item.board}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
