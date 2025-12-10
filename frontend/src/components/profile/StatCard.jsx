import React from 'react'

function StatCard({ label, value, icon }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
      {/* 아이콘 배경 및 색상 설정 */}
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full border-gray-200 bg-white text-gray-500 shadow-sm">
        {icon}
      </div>
      <span className="mb-1 text-2xl font-bold text-gray-700">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}

export default StatCard
