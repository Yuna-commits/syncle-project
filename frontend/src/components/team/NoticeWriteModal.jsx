import React, { useState, useEffect } from 'react'
import {
  useCreateTeamNotice,
  useUpdateTeamNotice,
} from '../../hooks/team/useTeamMutations'
import { X, Loader2, Megaphone, AlertCircle } from 'lucide-react'

const NoticeWriteModal = ({ isOpen, onClose, teamId, noticeToEdit }) => {
  // 모드 확인 (수정 vs 생성)
  const isEditMode = !!noticeToEdit

  // React Query Hooks
  const { mutate: createNotice, isPending: isCreating } =
    useCreateTeamNotice(teamId)
  const { mutate: updateNotice, isPending: isUpdating } =
    useUpdateTeamNotice(teamId)

  // 로딩 상태 통합
  const isSubmitting = isCreating || isUpdating

  // Form States
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [error, setError] = useState('')

  // 수정 모드일 경우 기존 데이터 채워넣기
  useEffect(() => {
    if (isOpen) {
      if (noticeToEdit) {
        setTitle(noticeToEdit.title)
        setContent(noticeToEdit.content)
        setIsImportant(noticeToEdit.isImportant)
      } else {
        // 생성 모드일 때 초기화
        resetForm()
      }
      setError('')
    }
  }, [isOpen, noticeToEdit])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setIsImportant(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // 간단한 유효성 검사
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    const payload = {
      title,
      content,
      isImportant,
    }

    // 성공 시 실행할 콜백
    const options = {
      onSuccess: () => {
        onClose() // 모달 닫기
        resetForm() // 폼 초기화
      },
      onError: (err) => {
        // 에러 메시지 처리 (서버 응답에 따라 다를 수 있음)
        setError(
          err.response?.data?.message ||
            '공지사항 저장 중 오류가 발생했습니다.',
        )
      },
    }

    if (isEditMode) {
      updateNotice({ noticeId: noticeToEdit.id, data: payload }, options)
    } else {
      createNotice(payload, options)
    }
  }

  if (!isOpen) return null

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
      <div
        className="animate-in zoom-in-95 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            {isEditMode ? '공지사항 수정' : '새 공지사항 작성'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상세 내용을 입력하세요..."
              className="min-h-[200px] w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Important Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${isImportant ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}
              >
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">필독 설정</p>
                <p className="text-xs text-gray-500">
                  설정 시 목록 상단에 고정되고 강조됩니다.
                </p>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-red-500 peer-focus:ring-4 peer-focus:ring-red-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : isEditMode ? (
              '수정하기'
            ) : (
              '등록하기'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeWriteModal
