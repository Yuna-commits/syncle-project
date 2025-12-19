/* eslint-disable no-unused-vars */
import React from 'react'

// UI 컴포넌트: 섹션 헤더
function SectionHeader({ icon: Icon, title, description }) {
  return (
    <>
      <div className="mt-8 mb-4 flex items-center gap-3 first:mt-0">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 p-2 text-gray-600">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </>
  )
}

export default SectionHeader
