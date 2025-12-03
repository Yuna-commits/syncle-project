import React, { useState } from 'react'
import BoardList from './BoardList'
import useBoardStore from '../../stores/useBoardStore'

/**
 * N개의 리스트를 담을 하나의 캔버스 공간
 * -> 보드에 표시될 데이터 렌더링
 */
function BoardCanvas({ board, columnRefs }) {
  const { addList } = useBoardStore()
  const [isAdding, setIsAdding] = useState(false) // 추가 리스트 존재 여부
  const [title, setTitle] = useState('')

  // 리스트 추가 핸들러
  const handleAddList = (e) => {
    e.preventDefault()

    // 리스트 제목이 있는 경우
    if (title.trim()) {
      addList(title)
      setTitle('')
      setIsAdding(false)
    }
  }

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden bg-gray-100/50 p-6">
      <div className="flex h-full items-start gap-6">
        {/* 보드에 속한 리스트들 하나씩 렌더링 */}
        {Object.values(board.columns).map((column) => (
          <BoardList
            key={column.id}
            column={column}
            innerRef={(el) => (columnRefs.current[column.id] = el)}
          />
        ))}

        {/* 리스트 추가 버튼 */}
        <div className="w-72 shrink-0">
          {isAdding ? (
            <form
              onSubmit={handleAddList}
              className="animate-fade-in rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200"
            >
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리스트 제목 입력..."
                className="mb-2 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex w-full items-center gap-2 rounded-xl bg-white/50 p-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-white hover:text-blue-600 hover:shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              리스트 추가
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardCanvas
