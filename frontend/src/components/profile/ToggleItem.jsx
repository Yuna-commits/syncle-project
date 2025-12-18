import React from 'react'

// UI 컴포넌트: 토글 아이템
function ToggleItem({ label, subLabel, checked, onChange }) {
  return (
    <>
      <div className="flex items-center justify-between rounded-md border-b border-gray-100 px-2 py-4 transition-colors last:border-0 hover:bg-gray-50">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {subLabel && (
            <span className="mt-1 text-xs text-gray-500">{subLabel}</span>
          )}
        </div>

        {/* 커스텀 토글 스위치 (Tailwind) */}
        <button
          onClick={onChange}
          className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </>
  )
}

export default ToggleItem
