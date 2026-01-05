import React, { useState } from 'react'
import { useBoardMutations } from '../../../hooks/board/useBoardMutations'
import { X } from 'lucide-react'
import { useToast } from '../../../hooks/useToast'

function CreateBoardMenu({ teamId, onClose, onSuccess }) {
  // 입력 상태 관리
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')

  const { createBoard } = useBoardMutations(undefined)
  const { showToast } = useToast()

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    createBoard(
      { teamId, data: { title, description, visibility } },
      {
        onSuccess: (res) => {
          const newBoard = res.data.data
          showToast('새로운 보드가 생성되었습니다.', 'success')
          if (onSuccess) onSuccess(newBoard)
          onClose()
        },
        onError: () => {
          showToast('보드 생성 중 오류가 발생했습니다.', 'error')
        },
      },
    )
  }

  return (
    <div
      className="absolute bottom-0 left-full z-10 ml-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="mb-3 text-sm font-bold text-gray-700">보드 생성</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="보드 제목"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="보드에 대한 설명을 입력해주세요."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            공개범위
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="PRIVATE">비공개</option>
            <option value="PUBLIC">전체 공개</option>
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:bg-gray-300"
          >
            생성
          </button>
        </div>
      </form>

      {/* 닫기 버튼 (X) */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:cursor-pointer hover:text-gray-600"
      >
        <X size={20} />
      </button>
    </div>
  )
}

export default CreateBoardMenu
