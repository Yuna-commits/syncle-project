/* eslint-disable no-unused-vars */
import React from 'react'

// UI 컴포넌트: 섹션 헤더
function SectionHeader({ icon: Icon, title, description }) {
  return (
    <>
      <div className="mt-8 mb-4 flex items-center gap-3 first:mt-0">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </>
  )
}

export default SectionHeader
