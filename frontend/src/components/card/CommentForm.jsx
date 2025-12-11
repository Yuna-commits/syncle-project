import React, { useState } from 'react'

const CommentForm = ({
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder = '댓글을 입력하세요...',
  submitLabel = '저장',
}) => {
  const [text, setText] = useState(initialValue)

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit(text)
    setText('') // 제출 후 초기화
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 pr-16 text-sm shadow-sm transition-shadow outline-none hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        rows={text ? 2 : 1}
        autoFocus={!!onCancel} // 취소 버튼이 있으면(수정/답글) 자동 포커스
      />

      <div className="absolute right-2 bottom-2 flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            취소
          </button>
        )}
        {text && (
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-700"
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default CommentForm
