import React from 'react'
import useBoardStore from '../../stores/useBoardStore'
import {
  CheckCircle,
  Clock,
  Paperclip,
  User,
  MessageSquare,
  CheckSquare,
} from 'lucide-react'
import { getDateStatusStyle } from '../../utils/dateUtils'
import { PRIORITY_STYLES, PRIORITY_LABELS } from '../../constants/priority'

/**
 * 1개의 카드 렌더링
 */
function TaskCard({ task }) {
  console.log('카드 정보: ', task)

  const { openCardModal } = useBoardStore()

  // 스타일 계산
  const { bg, border, text, dateLabel } = getDateStatusStyle(task.dueDate)

  const isDone = task.isComplete

  // 파일 존재 여부 확인
  const hasFiles = task.files && task.files.length > 0

  // 댓글 개수
  const commentCount = task.commentCount || 0

  // 체크리스트 진행률
  const checklists = task.checklists || []
  const totalCheckitems = checklists.length
  const completedCheckitems = checklists.filter((item) => item.done).length

  // 우선순위 스타일 가져오기
  const priorityStyle = task.priority ? PRIORITY_STYLES[task.priority] : null

  const isAssigneeLeft = task.assignee.isAssigneeLeft

  return (
    <div
      data-id={task.id}
      onClick={() => openCardModal(task)}
      className={`group mb-3 cursor-pointer rounded-lg border p-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${bg} ${border} hover:border-blue-400 ${isDone ? 'bg-gray-50 opacity-60' : ''} `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* 완료 아이콘 */}
          {isDone && (
            <CheckCircle size={18} className="shrink-0 text-green-500" />
          )}

          {/* 제목 */}
          <h4
            className={`text-sm leading-snug font-semibold text-gray-800 ${isDone ? 'text-gray-400 line-through' : ''}`}
          >
            {task.title}
          </h4>

          {/* 라벨 뱃지 (제목 바로 옆에 위치) */}
          {task.label && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: task.labelColor || '#6b7280' }}
            >
              {task.label}
            </span>
          )}

          {/* 우선순위 뱃지 */}
          {task.priority && !isDone && (
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${priorityStyle}`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          )}
        </div>

        {/* 담당자 아바타 (우측 상단 고정) */}
        {task.assignee && (
          <div
            className="shrink-0 pt-0.5"
            title={
              isAssigneeLeft
                ? '탈퇴한 멤버입니다.'
                : task.assignee.name || '담당자'
            }
          >
            <div
              className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ring-1 ${
                isAssigneeLeft
                  ? 'bg-gray-200 opacity-70 ring-gray-300 grayscale'
                  : 'ring-blue-100'
              }`}
            >
              {task.assignee.profileImg ? (
                <img
                  src={task.assignee.profileImg}
                  alt={task.assignee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className={`flex h-full w-full items-center justify-center text-xs font-bold ${
                    isAssigneeLeft
                      ? 'bg-gray-200 text-gray-500' // 탈퇴 시 텍스트 색상
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {task.assignee.name?.slice(0, 1) || <User size={12} />}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="mt-4 flex items-center justify-between">
        {/* 좌측: 날짜 */}
        <div className="flex items-center">
          {dateLabel && (
            <div
              className={`flex items-center gap-1 text-[12px] font-medium ${text}`}
              title="마감일"
            >
              <Clock size={13} />
              <span>{dateLabel}</span>
            </div>
          )}
        </div>

        {/* 우측: 메타 정보 아이콘 */}
        <div className="flex items-center gap-3 text-gray-500">
          {/* 댓글 */}
          {commentCount > 0 && (
            <div
              className="flex items-center gap-1 text-[12px] font-medium hover:text-gray-700"
              title={`댓글 ${commentCount}개`}
            >
              <MessageSquare size={13} />
              <span>{commentCount}</span>
            </div>
          )}

          {/* 체크리스트 */}
          {totalCheckitems > 0 && (
            <div
              className={`flex items-center gap-1 text-[12px] font-medium hover:text-gray-700 ${
                totalCheckitems === completedCheckitems ? 'text-green-600' : ''
              }`}
              title={`체크리스트 ${completedCheckitems}/${totalCheckitems} 완료`}
            >
              <CheckSquare size={13} />
              <span>
                {completedCheckitems}/{totalCheckitems}
              </span>
            </div>
          )}

          {/* 파일 */}
          {hasFiles && (
            <div
              className="flex items-center gap-1 text-[12px] font-medium hover:text-gray-700"
              title={`첨부파일 ${task.files.length}개`}
            >
              <Paperclip size={13} />
              <span>{task.files.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
