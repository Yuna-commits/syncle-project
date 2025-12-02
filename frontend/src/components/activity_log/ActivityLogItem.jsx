import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import React from 'react'

export default function ActivityLogItem({ log }) {
  // 1. 활동 타입별 스타일 및 아이콘 매핑
  const getTypeStyle = (type) => {
    if (type.includes('CREATE')) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-600',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        ),
      }
    }
    if (type.includes('DELETE') || type.includes('KICK')) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-600',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        ),
      }
    }
    if (type.includes('MOVE')) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
              clipRule="evenodd"
            />
          </svg>
        ),
      }
    }
    if (type.includes('COMMENT')) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 001.812.085c.665 0 1.33-.006 1.992-.018V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        ),
      }
    }
    // Default (UPDATE 등)
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
        </svg>
      ),
    }
  }

  const style = getTypeStyle(log.type)

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-transparent bg-gray-50 p-4 transition-all hover:border-blue-100 hover:bg-blue-50/50 hover:shadow-sm">
      {/* Header: 아이콘 + 타겟 + 보드 정보 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* 1. 아이콘 (타입별 색상) */}
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
          >
            {style.icon}
          </div>

          <div className="flex flex-col">
            {/* 2. 타겟 이름 (Bold) */}
            <span className="text-sm font-bold text-gray-900">
              {log.targetName || '이름 없음'}
            </span>

            {/* 3. 문맥 정보 (어디서? - 보드/팀) */}
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {/* 행위자 (팀 로그 조회 시 유용) */}
              {log.actorName && (
                <span className="font-medium text-gray-700">
                  {log.actorName}
                </span>
              )}

              {/* 보드 배지 */}
              {log.boardTitle && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center rounded-md bg-gray-200 px-1.5 text-[10px] font-medium text-gray-600">
                    {log.boardTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. 시간 (상대 시간: 5분 전) */}
        <span className="shrink-0 text-xs font-medium text-gray-400">
          {formatDistanceToNow(new Date(log.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
      </div>

      {/* 5. 상세 설명 (Description) */}
      <div className="pl-11">
        <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-gray-600">
          {log.description}
        </p>
      </div>
    </div>
  )
}
