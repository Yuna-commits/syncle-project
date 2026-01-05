import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeamNoticesQuery } from '../../hooks/team/useTeamQuery'
import { Megaphone, ChevronRight } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

const ImportantNoticeWidget = ({ teamId }) => {
  const navigate = useNavigate()

  // React Query를 통해 데이터 조회 (캐시 활용)
  const { data: notices } = useTeamNoticesQuery(teamId)

  // 1. 중요 공지(isImportant === true) 중 가장 최신 것 1개 찾기
  // (백엔드 정렬 순서에 의존하거나, 안전하게 sort 후 find 사용)
  const importantNotice = notices?.find((n) => n.isImportant)

  // 중요 공지가 없으면 아무것도 렌더링하지 않음 (공간 차지 X)
  if (!importantNotice) return null

  return (
    <div
      role="button"
      onClick={() => navigate(`/teams/${teamId}/notices`)}
      className="group animate-in fade-in slide-in-from-right-4 relative flex w-72 max-w-xs cursor-pointer items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-100"
    >
      {/* 아이콘 영역 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-orange-500 shadow-sm">
        <Megaphone className="h-4 w-4" />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="rounded-full border border-orange-200 bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
            필독
          </span>
          <span className="text-[10px] text-gray-400">
            {formatDate(importantNotice.createdAt)}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-orange-700">
          {importantNotice.title}
        </p>
      </div>

      {/* 화살표 (Hover시 약간 이동하는 애니메이션) */}
      <div className="shrink-0 text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-500">
        <ChevronRight className="h-5 w-5" />
      </div>

      {/* (선택사항) 반짝이는 효과: 아주 중요한 느낌을 주고 싶다면 추가 */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
      </span>
    </div>
  )
}

export default ImportantNoticeWidget
