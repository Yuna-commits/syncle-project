import React from 'react'

export default function BoardCard({ board }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:cursor-pointer hover:shadow-md">
      <div>
        <h5 className="text-base font-semibold text-blue-600">{board.title}</h5>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {board.description || '설명이 없습니다.'}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>활동 {board.activityCount}회</span>
        <span>{board.createdAt?.split('T')[0]}</span>
      </div>
    </div>
  )
}
