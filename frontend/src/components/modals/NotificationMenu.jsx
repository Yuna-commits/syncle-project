import { Bell, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotificationMutations } from '../../hooks/notification/useNotificationMutations'
import { useNotificationQuery } from '../../hooks/notification/useNotificationQuery'
import {
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import defaultProfile from '../../assets/images/default.png'

function NotificationMenu({ onClose, anchorEl }) {
  const navigate = useNavigate()

  // Floating UI 설정
  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose() // 닫힘 이벤트 감지 시 부모 닫기 함수 호출
    },
    middleware: [
      offset(8), // 아이콘과 메뉴 사이 간격 12px
      flip(), // 화면 공간 부족 시 위/아래 반전
      shift({ padding: 10 }), // 화면 밖으로 잘리지 않게 이동
    ],
    placement: 'bottom-end', // 기준 아이콘의 우측 하단 정렬
    elements: {
      reference: anchorEl, // 기준이 될 요소
    },
  })

  const { getFloatingProps } = useInteractions([useDismiss(context)])

  const { notifications, isLoading } = useNotificationQuery()
  const { markAsRead, markAllAsRead } = useNotificationMutations()

  // 알림 클릭 핸들러
  const handleItemClick = (notification) => {
    // 1. 개별 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    // 2. 알림과 연결된 페이지 이동
    if (notification.targetUrl) {
      navigate(notification.targetUrl)
      onClose()
    }
  }

  // 날짜 포맷팅
  const formatTime = (dateData) => {
    if (!dateData) return ''

    let date
    if (Array.isArray(dateData)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateData
      date = new Date(year, month - 1, day, hour, minute, second)
    } else {
      date = new Date(dateData)
    }

    const now = new Date()
    const diffMin = Math.floor((now - date) / (1000 * 60))

    if (diffMin < 1) return '방금 전'
    if (diffMin < 60) return `${diffMin}분 전`

    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}시간 전`

    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const renderMessageContent = (noti) => {
    const { message, type } = noti
    // 댓글/답글/멘션 타입인 경우 '알림 문구'와 '내용'을 분리
    if (type && type.includes('COMMENT')) {
      const separatorIndex = message.indexOf(':') // 첫 번째 ':' 위치 찾음

      if (separatorIndex > -1) {
        const titlePart = message.slice(0, separatorIndex)
        const contentPart = message.slice(separatorIndex + 1).trim()

        return (
          <div className="text-sm">
            {/* 알림 문구 (Bold 처리) */}
            <span className="text-medium font-semibold text-gray-700">
              {titlePart}
            </span>

            {/* 실제 내용 (줄바꿈 처리(whitespace-pre-wrap) + 박스 스타일) */}
            <div className="mt-1 border-l-2 border-gray-300 p-2 text-sm whitespace-pre-wrap text-gray-500">
              {contentPart}
            </div>
          </div>
        )
      }
    }

    // 그 외 일반 알림
    return (
      <p className="border-l-2 border-gray-300 p-2 text-sm leading-relaxed break-keep whitespace-pre-wrap text-gray-500">
        {message}
      </p>
    )
  }

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="z-50 w-96 rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      {/* 상단 영역 */}
      <div className="flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">알림</h2>
        </div>

        <button
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-500 transition-colors hover:bg-gray-200 hover:text-blue-700"
          onClick={() => markAllAsRead()}
        >
          <Check size={12} />
          모두 읽음
        </button>
      </div>

      {/* 알림 목록 영역 */}
      <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            로딩 중...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Bell size={40} className="mb-2 opacity-20" />
            <p className="text-sm">새로운 알림이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((noti) => (
              <li
                key={noti.id}
                onClick={() => handleItemClick(noti)}
                className={`group relative flex cursor-pointer items-start gap-4 px-2 py-2 transition-colors hover:bg-blue-50 ${
                  !noti.isRead ? 'bg-blue-50/30' : 'bg-white'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                    <img
                      src={noti.senderProfileImg || defaultProfile}
                      alt=""
                      className="h-full w-full object-cover"
                      // 이미지 로드 실패 시 숨기고 배경색만 보이게 하거나 기본 아이콘 노출
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.classList.add(
                          'flex',
                          'items-center',
                          'justify-center',
                        )
                      }}
                    />
                    {/* 읽지 않음 표시 (파란 점) */}
                    {!noti.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm"></span>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {/* 상단: 닉네임 + 시간 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      {noti.senderNickname || '알 수 없음'}
                    </span>
                    <span className="text-xs whitespace-nowrap text-gray-400">
                      {formatTime(noti.createdAt)}
                    </span>
                  </div>

                  {/* 하단: 메시지 내용 */}
                  {renderMessageContent(noti)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 하단 영역 */}
      <div className="rounded-b-xl border-t border-gray-100 bg-gray-50/50 p-2 text-center">
        <button
          onClick={() => {
            navigate('/notifications')
            onClose?.()
          }}
          className="w-full rounded-lg py-2 text-xs font-semibold text-gray-600 transition-colors hover:cursor-pointer hover:bg-blue-100 hover:text-gray-800"
        >
          모든 알림 보기
        </button>
      </div>
    </div>
  )
}

export default NotificationMenu
