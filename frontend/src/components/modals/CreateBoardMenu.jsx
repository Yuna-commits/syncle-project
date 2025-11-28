import React, { useState } from 'react'
import api from '../../api/AxiosInterceptor'

function CreateBoardMenu({ teamId, onClose, onSuccess }) {
  // 입력 상태 관리
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('TEAM')

  // UI 상태 관리
  const [error, setError] = useState(null)

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('보드 제목은 필수입니다.')
      return
    }

    try {
      setError(null)

      // API 호출
      const response = await api.post(`/teams/${teamId}/boards`, {
        title,
        description,
        visibility,
      })

      const newBoard = response.data.data
      onSuccess(newBoard) // 보드 생성 성공 콜백 호출
      onClose()
    } catch (err) {
      console.error('보드 생성 실패:', err)
      setError('보드 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div
      className="absolute bottom-0 left-full z-10 ml-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
      // 팝오버 안쪽 클릭 시, "바깥 클릭"으로 감지되지 않도록 이벤트 전파 중단
      onClick={(e) => e.stopPropagation()}
    >
      {/* 2. 헤더 (제목 + 닫기 버튼) */}
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-base font-semibold text-gray-800">새 보드</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-200"
          aria-label="Close popover"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 3. 모달 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ----- 1. 제목 (Title) ----- */}
        <div>
          <label
            htmlFor="boardTitlePop"
            className="block text-sm font-medium text-gray-700"
          >
            보드 제목
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            id="boardTitlePop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="프로젝트 제목 입력"
            autoFocus
            className={`mt-1 w-full rounded-md border ${
              error ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* ----- 2. 설명 (Description) ----- */}
        <div>
          <label
            htmlFor="boardDescPop"
            className="block text-sm font-medium text-gray-700"
          >
            설명
          </label>
          <textarea
            id="boardDescPop"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="보드에 대한 간단한 설명을 입력하세요."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* ----- 3. 공개범위 (Visibility) ----- */}
        <div>
          <label
            htmlFor="boardVisPop"
            className="block text-sm font-medium text-gray-700"
          >
            공개범위
          </label>
          <select
            id="boardVisPop"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="PRIVATE">Private</option>
            <option value="TEAM">Team</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>

        {/* 4. 폼 버튼 */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateBoardMenu
