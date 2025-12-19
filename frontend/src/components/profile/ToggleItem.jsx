import React from 'react'

// UI 컴포넌트: 토글 아이템
function ToggleItem({ label, subLabel, checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`group flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200 ${
        checked
          ? 'border-blue-200 bg-blue-50/60' // 활성화: 연한 파랑 배경 + 테두리
          : 'border-transparent bg-transparent hover:bg-gray-100' // 비활성화: 투명 + 회색 호버
      }`}
    >
      <div className="flex flex-col pr-4">
        <span
          className={`text-[15px] transition-colors ${
            checked
              ? 'font-bold text-blue-900' // 활성화: 굵고 진한 파랑 텍스트
              : 'font-medium text-gray-700 group-hover:text-gray-900' // 비활성화: 회색
          }`}
        >
          {label}
        </span>
        {subLabel && (
          <span
            className={`mt-0.5 text-xs transition-colors ${
              checked ? 'text-blue-600/80' : 'text-gray-500'
            }`}
          >
            {subLabel}
          </span>
        )}
      </div>

      {/* 토글 스위치 */}
      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
          checked
            ? 'border-blue-600 bg-blue-600'
            : 'bg-gray-200 group-hover:bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          } mt-1`}
        />
      </div>
    </div>
  )
}

export default ToggleItem
