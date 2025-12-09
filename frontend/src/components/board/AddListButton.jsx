import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { Plus, X } from 'lucide-react'

function AddListButton() {
  const { addList } = useBoardStore()
  const [title, setTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddList = (e) => {
    e.preventDefault()
    if (title.trim()) {
      addList(title)
      setTitle('')
      setIsAdding(false)
    }
  }

  return (
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
            // 입력 중 드래그 방지
            onMouseDown={(e) => e.stopPropagation()}
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
              className="rounded p-1.5 text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center gap-2 rounded-xl bg-white/50 p-3 text-sm font-medium text-gray-500 transition-all duration-200 hover:cursor-pointer hover:bg-white hover:text-blue-600 hover:shadow-sm"
        >
          <Plus size={20} />
          리스트 추가
        </button>
      )}
    </div>
  )
}

export default AddListButton
