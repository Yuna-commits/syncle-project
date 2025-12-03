import React from 'react'
import useBoardStore from '../../stores/useBoardStore'

/**
 * 1개의 카드 렌더링
 */
function TaskCard({ task }) {
  const { openCardModal } = useBoardStore()

  return (
    <div
      onClick={() => openCardModal(task)}
      className="group mb-2 cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-blue-500 hover:shadow-md active:scale-[0.98]"
    >
      {/* 카드 태그 */}
      {task.tag && (
        <span className="mb-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
          {task.tag}
        </span>
      )}

      <h4 className="text-sm leading-snug font-medium text-gray-800">
        {task.title}
      </h4>

      {/* 하단 정보 */}
      <div className="mt-2 flex items-center justify-between">
        {/* 담당자 아바타 Placeholder */}
        <div className="flex -space-x-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-indigo-500 text-[9px] text-white">
            M
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
