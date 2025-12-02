import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SidebarTeamItem from '../sidebar/SidebarTeamItem'
import useTeamStore from '../../stores/useTeamStore'

function Sidebar() {
  const location = useLocation()
  const { teams, fetchTeams } = useTeamStore()
  const [selectedTeam, setSelectedTeam] = useState({})

  // 팀 목록 불러오기
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

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
          {teams.map((team) => (
            <SidebarTeamItem
              key={team.id}
              team={team}
              isSelected={!!selectedTeam[team.id]}
              onToggle={toggleTeam}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
