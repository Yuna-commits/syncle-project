import React from 'react'
import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-4">
      {/* 상단 메뉴 */}
      <nav className="mt-2 space-y-1">
        <Link
          to="dashboard"
          className="block rounded-md bg-blue-50 px-3 py-2 font-semibold text-blue-700"
        >
          대시보드
        </Link>
        <Link
          to="Calender"
          className="block rounded-md px-3 py-2 font-semibold hover:bg-gray-200"
        >
          캘린더
        </Link>
        <Link
          to="notifications"
          className="block rounded-md px-3 py-2 font-semibold hover:bg-gray-200"
        >
          알림
        </Link>
      </nav>

      {/* Team 목록 */}
      <div className="mt-8">
        <h2 className="mb-3 px-3 text-sm font-semibold text-gray-500">Team</h2>

        <div className="space-y-4">
          {/* ---------------- 첫 번째 Workspace (펼쳐진 상태) ---------------- */}
          <div>
            <div className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">
                  A
                </div>
                <span className="font-medium">default</span>
              </div>

              {/* 펼친 상태 화살표 ↓ */}
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeWidth="2" d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* --- 펼쳐진 메뉴 --- */}
            <div className="mt-2 ml-10 space-y-2 text-sm">
              <div className="flex cursor-pointer items-center gap-2 text-gray-700 hover:underline">
                <svg
                  className="h-4 w-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
                보드
              </div>

              <div className="flex cursor-pointer items-center justify-between gap-2 text-gray-700 hover:underline">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM6 11c1.657 0 3-1.343 3-3S7.657 5 6 5 3 6.343 3 8s1.343 3 3 3zm10 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4zm-10 0c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z"
                    />
                  </svg>
                  보드 멤버
                </div>

                {/* + 아이콘 */}
                <svg
                  className="h-4 w-4 text-gray-600"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M12 5v14m7-7H5"
                  />
                </svg>
              </div>

              <div className="flex cursor-pointer items-center gap-2 text-gray-700 hover:underline">
                <svg
                  className="h-4 w-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6 1V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7"
                  />
                </svg>
                설정
              </div>
            </div>
          </div>

          {/* ---------------- 다른 Workspace (닫힌 상태) ---------------- */}
          <div>
            <div className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500 text-sm font-bold text-white">
                  T
                </div>
                <span className="font-medium">A Team</span>
              </div>

              {/* 닫힌 상태 화살표 → */}
              <svg
                className="h-4 w-4 -rotate-90 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeWidth="2" d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Trello Workspace (닫힌 상태) */}
          <div>
            <div className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 text-sm font-bold text-white">
                  T
                </div>
                <span className="font-medium">B Team</span>
              </div>

              <svg
                className="h-4 w-4 -rotate-90 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeWidth="2" d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
