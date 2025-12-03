import React from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { Link } from 'react-router-dom'

function BoardHeader({ board }) {
  const { toggleSettings, toggleFavorite } = useBoardStore()

  const teamName = board.teamName
  const teamInitial = teamName.substring(0, 1).toUpperCase()

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* 왼쪽: 보드 정보 */}
      <div className="flex items-center gap-4">
        {/* 팀 아이콘 클릭 시 팀 페이지로 이동 */}
        <Link
          to={`/teams/${board.teamId}/boards`}
          className="group flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
          title={`${teamName} 팀 페이지로 이동`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 shadow-sm transition-transform group-hover:scale-105">
            <span className="text-sm font-bold text-white">{teamInitial}</span>
          </div>
        </Link>

        {/* 보드 이름 & 즐겨찾기 */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-800">{board.name}</h1>

          <button
            onClick={toggleFavorite}
            className={`transition-colors hover:cursor-pointer focus:outline-none ${
              board.isFavorite
                ? 'text-yellow-500 hover:text-yellow-600' // 활성화: 노란색
                : 'text-gray-300 hover:text-yellow-500' // 비활성화: 회색 -> 호버 시 노랑
            }`}
            title={board.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              // isFavorite이면 속 채우기(fill), 아니면 선만(none)
              fill={board.isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        </div>

        {/* 공개 범위 */}
        <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {board.visibility}
        </span>
      </div>

      {/* 오른쪽: 멤버 및 액션 */}
      <div className="flex items-center gap-3">
        {/* 멤버 아바타 스택 */}
        <div className="flex -space-x-2 overflow-hidden">
          {board.members.map((member) => (
            <div
              key={member.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white shadow-sm"
              title={member.name}
            >
              {/* 프로필 이미지가 없으면 텍스트 표시 */}
              {member.profileImg ? (
                <img
                  src={member.profileImg}
                  alt={member.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                member.name[0]
              )}
            </div>
          ))}
          <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200">
            +
          </button>
        </div>

        <div className="mx-2 h-5 w-px bg-gray-300"></div>

        {/* 필터 버튼 */}
        <button className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          <span className="hidden sm:inline">필터</span>
        </button>

        {/* 공유 버튼 */}
        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
          공유
        </button>

        {/* 더보기 메뉴 */}
        <button
          onClick={toggleSettings}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none"
          title="메뉴 열기"
        >
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
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default BoardHeader
