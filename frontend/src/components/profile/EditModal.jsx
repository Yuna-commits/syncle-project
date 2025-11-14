import React from 'react'

export default function EditModal({ title, fields, onClose }) {
  // 수정 기능은 나중에 추가
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            개인 정보 수정
          </h3>
        )}

        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">{field.label}</label>
              <input
                type={field.type}
                defaultValue={field.value}
                className="rounded border border-gray-400 px-3 py-2"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-gray-400 px-4 py-2 font-semibold text-gray-800 hover:cursor-pointer hover:bg-gray-300"
          >
            취소
          </button>
          <button className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:cursor-pointer hover:bg-blue-600">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
