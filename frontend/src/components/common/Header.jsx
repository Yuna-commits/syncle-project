import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useUiStore from '../../stores/useUiStore'
import { Plus } from 'lucide-react'
import defaultProfile from '../../assets/images/default.png'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'

function Header({ onOpenTeamModal }) {
  const notificationCount = 1
  const { data: user } = useAuthQuery()
  const { toggleMenu, closeAll } = useUiStore()
  const location = useLocation()

  useEffect(() => {
    // 경로가 바뀔 때마다 모든 메뉴 닫기
    closeAll()
  }, [location.pathname, closeAll])

  return (
    <nav className="flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-7">
      {/* ---------------- 좌측: 로고 ---------------- */}
      <Link to="dashboard" className="flex items-center gap-3">
        {/* 서비스 로고 */}
        <span className="text-xl font-semibold">Syncle</span>
      </Link>

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
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-white hover:bg-blue-700"
          onClick={onOpenTeamModal}
        >
          <Plus size={16} strokeWidth={3} />
          <span>팀 생성</span>
        </button>
      </div>

      {/* ---------------- 우측 아이콘들 ---------------- */}
      <div className="flex items-center gap-6 pr-4">
        {/* 벨 아이콘 + 알림 */}
        <div
          className="relative flex h-6 w-8 cursor-pointer items-center justify-center rounded-md transition hover:bg-gray-100"
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            toggleMenu('notification')
          }}
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
        <div
          // 1. shrink-0: 찌그러짐 방지
          // 2. overflow-hidden: 둥근 모서리 밖으로 이미지 튀어나옴 방지
          className="h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-gray-200 transition-opacity hover:opacity-80"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            toggleMenu('profile')
          }}
        >
          <img
            // 유저 이미지가 없으면 기본 이미지 사용
            src={user?.profileImg || defaultProfile}
            alt="Profile"
            // 3. object-cover: 이미지 비율 유지하며 꽉 채우기
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </nav>
  )
}

export default Header
