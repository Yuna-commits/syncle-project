import React from 'react'
import useBoardStore from '../../stores/sample'

function BoardSettings({ board }) {
  const { toggleSettings } = useBoardStore()

  return (
    <div className="absolute top-0 right-0 z-30 h-full w-80 transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-bold text-gray-800">메뉴</h2>
        <button
          onClick={toggleSettings}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="space-y-6 p-4">
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
            <div className="h-6 w-6 rounded bg-gray-300"></div>
            {board.name}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <button className="-ml-2 block w-full rounded p-2 text-left hover:bg-gray-100">
              이 보드에 관하여
            </button>
            <button className="-ml-2 block w-full rounded p-2 text-left hover:bg-gray-100">
              배경 변경
            </button>
          </div>
        </section>

        <div className="h-px bg-gray-200"></div>

        <section>
          <div className="space-y-2 text-sm text-gray-600">
            <button className="-ml-2 block w-full rounded p-2 text-left hover:bg-gray-100">
              아카이브된 항목
            </button>
            <button className="-ml-2 block w-full rounded p-2 text-left font-medium text-red-600 hover:bg-gray-100">
              보드 삭제
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BoardSettings
