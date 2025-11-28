import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/AxiosInterceptor'

function Sidebar() {
  const location = useLocation()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/teams')
        const data = response.data.data
        console.log('팀 목록:', data)
        setTeams(data)

        if (data.length > 0) {
          setSelectedTeam(data[0])
        }
      } catch (error) {
        console.error('팀 조회 실패', error)
      }
    }

    fetchTeams()
  }, [])

  // 팀 메뉴 토글
  const toggleTeam = (teamId) => {
    setSelectedTeam((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? 'bg-blue-50 text-blue-700 font-semibold'
      : 'hover:bg-gray-100 font-medium text-gray-600'

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-4">
      {/* 상단 메뉴 */}
      <nav className="mt-2 space-y-1">
        <Link
          to="dashboard"
          className={`block rounded-md px-3 py-2 ${isActive('/dashboard')}`}
        >
          대시보드
        </Link>
        <Link
          to="calendar"
          className={`block rounded-md px-3 py-2 ${isActive('/calendar')}`}
        >
          캘린더
        </Link>
        <Link
          to="notifications"
          className={`block rounded-md px-3 py-2 ${isActive('/notifications')}`}
        >
          알림
        </Link>
      </nav>

      {/* Team 목록 */}
      <div className="mt-8">
        <h2 className="mb-3 px-3 text-sm font-semibold text-gray-500">Team</h2>

        <div className="space-y-1">
          {teams.map((team) => {
            // 데이터에 id 혹은 teamId가 혼용될 수 있으므로 확실한 값 사용
            const tId = team.id || team.teamId
            const isExpanded = selectedTeam[tId] // 현재 이 팀이 펼쳐져 있는지 확인

            return (
              <div key={tId}>
                {/* 팀 헤더 (클릭 시 토글) */}
                <button
                  onClick={() => toggleTeam(tId)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500 text-[10px] font-bold text-white">
                      {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {team.name}
                    </span>
                  </div>

                  {/* 화살표 아이콘 */}
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 하위 메뉴 (펼쳐져 있을 때만 보임) */}
                {isExpanded && (
                  <div className="mt-1 ml-9 space-y-1">
                    <Link
                      to="dashboard/team-board" // 실제 이동할 경로 (예: `/teams/${tId}/boards`)
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        {/* 보드 아이콘 */}
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        보드
                      </div>
                    </Link>
                    <Link
                      to="#"
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        {/* 멤버 아이콘 */}
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        팀 멤버
                      </div>
                      <span className="cursor-pointer text-xs text-gray-400 hover:text-blue-500">
                        +
                      </span>
                    </Link>
                    <Link
                      to="#"
                      className="block rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        {/* 설정 아이콘 */}
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        설정
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
