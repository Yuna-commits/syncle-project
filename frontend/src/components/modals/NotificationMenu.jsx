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
import NotificationItem from '../common/NotificationItem'

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

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      onClick={(e) => e.stopPropagation()}
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
              <NotificationItem
                key={noti.id}
                notification={noti}
                onClick={handleItemClick}
                onClose={onClose}
                isMenu={true}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 하단 영역 */}
      <div className="border-t border-gray-100 bg-gray-50 p-2">
        <button
          onClick={() => {
            navigate('/notifications')
            onClose()
          }}
          className="w-full rounded-md border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:cursor-pointer hover:bg-gray-200 hover:text-gray-800"
        >
          모든 알림 보기
        </button>
      </div>
    </div>
  )
}

export default NotificationMenu
