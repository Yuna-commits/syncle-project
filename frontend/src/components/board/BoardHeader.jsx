import React from 'react'
import useBoardStore from '../../stores/useBoardStore'

function BoardHeader({ board }) {
  const { toggleSettings } = useBoardStore()

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* 왼쪽: 보드 정보 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white shadow-sm">
            {board.name.substring(0, 2).toUpperCase()}
          </span>
          <h1 className="text-lg font-bold text-gray-800">{board.name}</h1>
        </div>
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
              {member.name[0]}
            </div>
          ))}
          <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200">
            +
          </button>
        </div>

        <div className="mx-2 h-5 w-px bg-gray-300"></div>

        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
          공유
        </button>
        <button
          onClick={toggleSettings}
          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
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
