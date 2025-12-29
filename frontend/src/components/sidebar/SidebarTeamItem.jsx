import React from 'react'
import { Link } from 'react-router-dom'
import { getTeamColorClass } from '../../constants/themeConstants'

function SidebarTeamItem({ team, isSelected, onToggle }) {
  // team 객체에서 안전하게 id와 name 추출
  const tId = team.id
  const tName = team.name

  // 팀 Owner 확인
  const isOwner = team.role === 'OWNER'

  // 현재 URL이 이 팀의 경로에 속해 있는지 확인
  const isTeamActive = location.pathname.startsWith(`/teams/${tId}`)

  // "NullPointer" 등 팀 이름에 따라 항상 고정된 색상 클래스 획득
  const bgClass = getTeamColorClass(tName)

  const teamHeaderClass =
    !isSelected && isTeamActive
      ? 'bg-blue-50 text-blue-700 font-semibold'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'

  const isActive = (path) => {
    return location.pathname.startsWith(path)
      ? 'bg-blue-50 text-blue-700 font-semibold' // 활성화 스타일
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' // 비활성화 스타일
  }

  return (
    <div>
      {/* 팀 헤더 버튼 */}
      <button
        onClick={() => onToggle(tId)}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 transition-colors ${teamHeaderClass}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white ${bgClass}`}
          >
            {tName ? tName.charAt(0).toUpperCase() : 'T'}
          </span>
          <span className="truncate text-sm font-medium">{tName}</span>
        </div>

        {/* 화살표 회전 애니메이션 */}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isSelected ? 'rotate-180' : ''
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

      {/* 하위 메뉴 (펼쳐졌을 때만 렌더링) */}
      {isSelected && (
        <div className="mt-1 ml-9 space-y-1">
          <Link
            to={`/teams/${tId}/boards`}
            className={`block rounded-md px-2 py-1.5 text-sm ${isActive('/teams/' + tId + '/boards')}`}
          >
            - 보드
          </Link>
          <Link
            to={`/teams/${tId}/members`}
            className={`block rounded-md px-2 py-1.5 text-sm ${isActive('/teams/' + tId + '/members')}`}
          >
            - 팀 멤버
          </Link>
          {isOwner && (
            <>
              <Link
                to={`/teams/${tId}/invitations`}
                className={`block rounded-md px-2 py-1.5 text-sm ${isActive('/teams/' + tId + '/invitations')}`}
              >
                - 초대 목록
              </Link>
              <Link
                to={`/teams/${tId}/settings`}
                className={`block rounded-md px-2 py-1.5 text-sm ${isActive('/teams/' + tId + '/settings')}`}
              >
                - 설정
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarTeamItem
