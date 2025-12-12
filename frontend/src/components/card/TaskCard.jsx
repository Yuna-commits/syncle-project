import React from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { CheckCircle, Clock } from 'lucide-react'
import { getDateStatusStyle } from '../../utils/dateUtils'
import { PRIORITY_STYLES, PRIORITY_LABELS } from '../../constants/priority'

/**
 * 1개의 카드 렌더링
 */
function TaskCard({ task }) {
  const { openCardModal } = useBoardStore()

  // 스타일 계산
  const { bg, border, text, dateLabel } = getDateStatusStyle(task.dueDate)

  const isDone = task.isComplete

  // 우선순위 스타일 가져오기
  const priorityStyle = task.priority ? PRIORITY_STYLES[task.priority] : null

  return (
    <div
      data-id={task.id}
      onClick={() => openCardModal(task)}
      className={`group mb-2 cursor-pointer rounded-lg border p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${bg} ${border} hover:border-blue-400 ${isDone ? 'bg-gray-50 opacity-60' : ''} `}
    >
      <div className="flex items-start gap-2">
        {/* 완료 시 체크 아이콘 표시 */}
        {isDone && (
          <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-500" />
        )}

        {/* 제목에 취소선 적용 */}
        <div className="flex flex-1 items-start justify-between gap-2">
          {/* 제목 */}
          <h4
            className={`text-sm leading-snug font-medium break-all text-gray-800 ${isDone ? 'text-gray-400 line-through' : ''}`}
          >
            {task.title}
          </h4>
          <div className="mb-0.5 flex flex-wrap items-center gap-1">
            {/* 라벨 뱃지 */}
            {task.label && (
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: task.labelColor || '#6b7280' }}
              >
                {task.label}
              </span>
            )}
            {/* 우선순위 뱃지 */}
            {task.priority && !isDone && (
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${priorityStyle}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 날짜 표시 */}
          {dateLabel && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${text}`}
              title="마감일"
            >
              <Clock size={10} />
              <span>{dateLabel}</span>
            </div>
          )}
        </div>

        {/* 담당자 아바타 */}
        {task.assignee && (
          <div
            className="flex -space-x-1"
            title={task.assignee.name || '담당자'}
          >
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
              {task.assignee.profileImg ? (
                <img
                  src={task.assignee.profileImg}
                  alt={task.assignee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                // 이미지가 없으면 이름 이니셜
                <span className="flex h-full w-full items-center justify-center bg-blue-50 text-xs font-bold text-blue-600">
                  {task.assignee.name?.slice(0, 1) || <User size={12} />}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
