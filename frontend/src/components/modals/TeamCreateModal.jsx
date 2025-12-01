import React, { useState } from 'react'
import { Users, X } from 'lucide-react'
import api from '../../api/AxiosInterceptor'

function TeamCreateModal({ onClose }) {
  // 팀 정보 상태
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 팀 생성 핸들러
  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsLoading(true)
    try {
      // API 호출
      await api.post('/teams', {
        name,
        description,
      })

      alert('팀이 생성되었습니다.')
      onClose()
      window.location.reload() // 목록 갱신
    } catch (error) {
      console.error('팀 생성 실패:', error)
      alert(error.response?.data?.message || '팀 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="animate-in fade-in zoom-in w-[520px] transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Users size={24} className="text-blue-600" />팀 생성
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* 팀 이름 */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              팀 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="팀 이름을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              autoFocus
            />
          </div>

          {/* 설명 */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              설명{' '}
              <span className="text-xs font-normal text-gray-400">(선택)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="팀의 목표나 특징을 간단히 적어주세요."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            ></textarea>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
              className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition ${
                !name.trim() || isLoading
                  ? 'cursor-not-allowed bg-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '생성 중...' : '생성하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamCreateModal
