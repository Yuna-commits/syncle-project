import React, { useState, useRef, useEffect } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import TaskCard from '../card/TaskCard'
import { MoreHorizontal, Plus, X } from 'lucide-react'

/**
 * N개의 카드 작업을 담을 하나의 리스트 랜더링
 */
function BoardList({ column, innerRef }) {
  const { addCard, deleteList, updateList } = useBoardStore()

  const [isAdding, setIsAdding] = useState(false)
  const [cardTitle, setCardTitle] = useState('')

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [listTitle, setListTitle] = useState(column.title)

  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddCard = (e) => {
    e.preventDefault()
    if (cardTitle.trim()) {
      addCard(column.id, cardTitle)
      setCardTitle('')
      setIsAdding(false)
    }
  }

  const handleDeleteList = () => {
    deleteList(column.id)
    setIsMenuOpen(false)
  }

  const handleUpdateTitle = () => {
    if (listTitle.trim() !== '' && listTitle !== column.title) {
      if (updateList) updateList(column.id, listTitle)
    }
    setIsEditing(false)
  }

  // 완료 리스트 여부
  const isDoneList = column.isVirtual

  // 리스트 배경 색
  const containerStyle = isDoneList
    ? 'bg-green-100/60 ring-green-200 hover:ring-green-300'
    : 'bg-gray-100/80 ring-gray-200/50 hover:ring-gray-300'

  return (
    <div
      data-id={column.id}
      className={`flex h-full max-h-full w-72 shrink-0 flex-col rounded-xl p-2 shadow-sm ring-1 transition-all ${containerStyle}`}
    >
      {/* 드래그 전용 핸들바 (Drag Handle)
        - board-list-header 클래스를 여기에만 적용합니다.
        - 제목 입력창과 분리되어 있어 드래그가 씹히지 않습니다.
      */}
      <div
        className="board-list-header group flex h-5 w-full cursor-grab items-center justify-center rounded-t-md hover:bg-gray-200/80 active:cursor-grabbing"
        title="이곳을 잡고 리스트를 이동하세요"
      >
        {/* 시각적 힌트: 작은 막대기 아이콘 */}
        <div className="h-1 w-8 rounded-full bg-gray-300 transition-colors group-hover:bg-gray-400"></div>
      </div>

      {/* === 리스트 헤더 영역 (제목 + 메뉴) === */}
      <div className="relative mb-2 flex items-center justify-between px-2 pt-1">
        {isEditing ? (
          <input
            autoFocus
            className="w-full rounded border border-blue-500 px-1 py-0.5 text-sm font-semibold text-gray-700 focus:outline-none"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle()
            }}
            // 입력 중 드래그 이벤트 전파 방지 (안전 장치)
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="flex w-full cursor-pointer items-center gap-2"
            onClick={() => setIsEditing(true)}
          >
            <h3
              className={`truncate text-sm font-semibold ${isDoneList ? 'text-green-800' : 'text-gray-700'}`}
            >
              {column.title}
            </h3>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${isDoneList ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'}`}
            >
              {column.tasks.length}
            </span>
          </div>
        )}

        <div className="relative ml-2" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <MoreHorizontal size={20} />
          </button>

          {isMenuOpen && (
            <div className="ring-opacity-5 absolute top-8 right-0 z-20 w-40 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
              <button
                onClick={() => {
                  setIsEditing(true)
                  setIsMenuOpen(false)
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:cursor-pointer hover:bg-gray-100"
              >
                ✏️ 리스트 이름 수정
              </button>

              <button
                onClick={handleDeleteList}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:cursor-pointer hover:bg-red-50"
              >
                🗑️ 리스트 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === 카드 리스트 영역 === */}
      <div
        ref={innerRef}
        data-column-id={column.id}
        className="custom-scrollbar min-h-[50px] flex-1 overflow-y-auto px-1 py-0.5"
      >
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* === 카드 추가 입력 === */}
      {/* 완료 리스트는 카드 추가 불가능 */}
      {!isDoneList &&
        (isAdding ? (
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
              onMouseDown={(e) => e.stopPropagation()}
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
                <X size={20} />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm font-medium text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-200"
          >
            <Plus size={20} className="text-gray-600" />
            카드 추가
          </button>
        ))}
    </div>
  )
}

export default BoardList
