import React from 'react'

function Header({ onOpenTeamModal, onOpenNotiModal }) {
  const notificationCount = 1
  return (
    <nav className="flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-7">
      {/* ---------------- 좌측: 로고 ---------------- */}
      <div className="flex items-center gap-3">
        {/* 서비스 로고 */}
        <div className="h-8 w-8 rounded-md bg-blue-600"></div>
        <span className="text-xl font-semibold">Syncle</span>
      </div>

      {/* ---------------- 가운데: 검색 + 버튼 ---------------- */}
      <div className="flex w-full max-w-2xl items-center gap-3 px-6">
        {/* 검색창 */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2.5"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
        </div>

        {/* Create 버튼 */}
        <button
          className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-white hover:bg-blue-700"
          onClick={onOpenTeamModal}
        >
          팀 생성
        </button>
      </div>

      {/* ---------------- 우측 아이콘들 ---------------- */}
      <div className="flex items-center gap-6 pr-4">
        {/* 벨 아이콘 + 알림 */}
        <div
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition hover:bg-gray-100"
          onClick={onOpenNotiModal}
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6z"
            />
          </svg>

          {/* 알림 */}
          <div className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        </div>

        {/* 프로필 아이콘 */}
        <div className="h-8 w-8 rounded-full bg-blue-600"></div>
      </div>
    </nav>
  )
}

export default Header
