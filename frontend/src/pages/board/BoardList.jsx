import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import TaskCard from './TaskCard'

/**
 * N개의 카드 작업을 담을 하나의 리스트 랜더링
 */
function BoardList({ column, innerRef }) {
  const { addCard } = useBoardStore()
  const [isAdding, setIsAdding] = useState(false) // 추가 카드 존재 여부
  const [cardTitle, setCardTitle] = useState('')

  // 카드 추가 핸들러
  const handleAddCard = (e) => {
    e.preventDefault()

    // 카드 제목이 있는 경우
    if (cardTitle.trim()) {
      addCard(column.id, cardTitle)
      setCardTitle('')
    }
  }

  return (
    <div className="flex h-full max-h-full w-72 shrink-0 flex-col rounded-xl bg-gray-100/80 p-2 shadow-sm ring-1 ring-gray-200/50">
      {/* 리스트 헤더 */}
      <div className="mb-2 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {/* 리스트 제목 */}
            {column.title}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
            {/* 리스트에 속한 카드 개수 */}
            {column.tasks.length}
          </span>
        </div>
        {/* 리스트 삭제 버튼 (삭제 기능 x) */}
        <button className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          </svg>
        </button>
      </div>

      {/* 하나의 리스트에 속한 카드 목록 (스크롤 가능) */}
      <div
        ref={innerRef}
        data-column-id={column.id}
        className="custom-scrollbar min-h-[50px] flex-1 overflow-y-auto px-1 py-0.5"
      >
        {/* 리스트에 속한 카드들을 하나씩 랜더링 */}
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* 카드 추가 입력 */}
      {isAdding ? (
        <form onSubmit={handleAddCard} className="mt-2 px-1 pb-1">
          <textarea
            autoFocus
            rows={2}
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="카드 제목을 입력하세요..."
            className="w-full resize-none rounded-lg border border-blue-500 bg-white p-2 text-sm shadow-sm focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAddCard(e)
              }
            }}
          />
          <div className="mt-1 flex items-center gap-2">
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-200"
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
          className="mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-gray-500"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          카드 추가
        </button>
      )}
    </div>
  )
}

export default BoardList
