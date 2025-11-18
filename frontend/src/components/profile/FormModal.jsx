import React, { useState } from 'react'

export default function FormModal({ title, fields, onSubmit, onClose }) {
  // 입력값 상태 저장
  const [formValues, setFormValues] = useState(() => {
    // fields 기반으로 초기화
    const initial = {}
    fields.forEach((f) => {
      initial[f.name] = f.value || ''
    })
    return initial
  })

  // 입력 시 상태 업데이트
  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  // 비밀번호 모달 판단
  const isPasswordModal =
    fields.some((f) => f.name === 'newPassword') &&
    fields.some((f) => f.name === 'confirmPassword')

  const newPw = formValues.newPassword || ''
  const confirmPw = formValues.confirmPassword || ''

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
        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">{field.label}</label>
              <input
                type={field.type}
                value={formValues[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="rounded border border-gray-400 px-3 py-2"
              />
            </div>
          ))}
        </div>

        {/* 비밀번호 일치 여부 표시 */}
        {isPasswordModal && showCheck && (
          <div className="mt-2">
            {isMatching && (
              <p className="text-sm font-medium text-green-600">
                ✔ 새 비밀번호가 일치합니다.
              </p>
            )}
            {!isMatching && (
              <p className="text-sm font-medium text-red-600">
                ✘ 비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-gray-400 px-4 py-2 font-semibold text-gray-800 hover:cursor-pointer hover:bg-gray-300"
          >
            취소
          </button>
          {/* 비밀번호가 일치하지 않으면 저장 버튼 비활성화 */}
          <button
            disabled={isPasswordModal && !isMatching}
            onClick={() => onSubmit(formValues)}
            className={`rounded px-4 py-2 font-semibold text-white hover:cursor-pointer ${
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
      </div>
    </div>
  )
}
