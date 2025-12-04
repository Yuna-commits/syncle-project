import React, { useState } from 'react'
import useBoardStore from '../../../stores/useBoardStore'

function BoardInfoView({ board, isOwner }) {
  const { updateBoard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: board.title,
    description: board.description || '',
  })

  // 보드 소유자 찾기
  const owner = board.members.find((m) => m.id === board.ownerId) || {
    name: '알 수 없음',
    email: '',
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateBoard(board.id, formData)
    alert('보드 정보가 저장되었습니다.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* 보드 오너 정보 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <label className="mb-2 block text-xs font-bold text-gray-500 uppercase">
          보드 관리자 (Owner)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {owner.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{owner.name}</p>
            <p className="text-xs text-gray-500">{owner.email}</p>
          </div>
        </div>
      </div>

      {/* 보드 정보 - Owner만 수정 가능 */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            보드 이름
          </label>
          <input
            type="text"
            // Owner가 아니면 비활성화
            disabled={!isOwner}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            설명
          </label>
          <textarea
            // Owner가 아니면 비활성화
            disabled={!isOwner}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="이 보드에 대한 설명을 입력하세요."
          />
        </div>
      </div>

      {/* Owner에게만 저장 버튼 노출 */}
      {isOwner ? (
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
        >
          저장
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">
          관리자만 보드 정보를 수정할 수 있습니다.
        </p>
      )}
    </form>
  )
}

export default BoardInfoView
