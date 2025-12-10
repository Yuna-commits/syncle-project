import React, { useEffect, useState } from 'react'
import FormInput from '../common/FormInput'
import { Check, X } from 'lucide-react'

export default function FormModal({ title, fields, onSubmit, onClose }) {
  const [formData, setFormData] = useState({})

  // 모달이 처음 열릴 때만 초기화
  useEffect(() => {
    const initialData = {}
    fields.forEach((field) => {
      initialData[field.name] = field.value || ''
    })
    setFormData(initialData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 입력 시 상태 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // 비밀번호 모달 판단
  const isPasswordModal =
    fields.some((f) => f.name === 'newPassword') &&
    fields.some((f) => f.name === 'confirmPassword')

  const newPw = formData.newPassword || ''
  const confirmPw = formData.confirmPassword || ''

  // 둘 다 입력이 없는 경우
  const showCheck = newPw.length > 0 && confirmPw.length > 0

  // 비밀번호 일치 판단
  const isMatching = newPw === confirmPw

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        {title && (
          <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
        )}

        {/* 필드 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <FormInput
              key={field.name}
              {...field}
              value={formData[field.name] || ''}
              onChange={handleChange}
              // 입력된 값을 인자로 전달
              onCheck={
                field.onCheck
                  ? () => field.onCheck(formData[field.name])
                  : undefined
              }
            />
          ))}

          {/* 비밀번호 일치 여부 표시 */}
          {isPasswordModal && showCheck && (
            <div className="mt-2">
              {isMatching && (
                <p className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <Check size={16} /> 새 비밀번호가 일치합니다.
                </p>
              )}
              {!isMatching && (
                <p className="flex items-center gap-1 text-sm font-medium text-red-600">
                  <X size={16} /> 비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
            >
              취소
            </button>
            {/* 비밀번호가 일치하지 않으면 저장 버튼 비활성화 */}
            <button
              disabled={isPasswordModal && !isMatching}
              type="submit"
              className={`rounded-lg px-4 py-2.5 font-medium text-white shadow-sm hover:cursor-pointer ${
                isPasswordModal
                  ? showCheck && isMatching
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'cursor-not-allowed bg-blue-300'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
