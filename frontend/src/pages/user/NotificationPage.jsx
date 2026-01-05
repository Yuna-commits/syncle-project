import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationQuery } from '../../hooks/notification/useNotificationQuery'
import { useNotificationMutations } from '../../hooks/notification/useNotificationMutations'
import { Bell, Check } from 'lucide-react'
import NotificationItem from '../../components/common/NotificationItem'

// 메인 알림 페이지
function NotificationPage() {
  const navigate = useNavigate()

  // 데이터 연동
  const { notifications, isLoading } = useNotificationQuery()
  const { markAsRead, markAllAsRead } = useNotificationMutations()

  const [activeTab, setActiveTab] = useState('ALL')

  // 탭 목록
  const tabs = [
    { id: 'ALL', label: '전체' },
    { id: 'ME', label: '나' }, // 멘션, 할당, 답글, 초대 등
    { id: 'COMMENT', label: '댓글' }, // 댓글 관련
    { id: 'WORK', label: '업무' }, // 상태 변경, 체크리스트 등
    { id: 'NOTICE', label: '알림' },
  ]

  // 탭 id에 따른 실제 알림 타입 매핑
  const getFilterTypes = (tabId) => {
    switch (tabId) {
      case 'ME':
        return [
          'MENTION',
          'CARD_ASSIGNED',
          'COMMENT_REPLY',
          'PERMISSION_CHANGED',
        ]
      case 'COMMENT':
        return ['COMMENT', 'COMMENT_REPLY', 'MENTION']
      case 'WORK':
        return [
          'CARD_MOVED',
          'CARD_UPDATED',
          'CHECKLIST_COMPLETED',
          'DEADLINE_NEAR',
          'FILE_UPLOAD',
        ]
      case 'NOTICE':
        return [
          'TEAM_INVITE',
          'BOARD_INVITE',
          'INVITE_ACCEPTED',
          'INVITE_REJECTED',

          'TEAM_MEMBER_KICKED',
          'TEAM_MEMBER_LEFT',
          'BOARD_MEMBER_KICKED',
          'BOARD_MEMBER_LEFT',

          'TEAM_DELETED',
          'BOARD_DELETED',

          'TEAM_NOTICE_CREATED',
        ]
      default:
        return [] // ALL인 경우
    }
  }

  // 필터링 로직
  const filteredNotifications = notifications.filter((noti) => {
    if (activeTab === 'ALL') return true
    const targetTypes = getFilterTypes(activeTab)
    return targetTypes.includes(noti.type)
  })

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    // 1. 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    // 2. 페이지 이동
    if (notification.targetUrl) {
      navigate(notification.targetUrl)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 영역 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">알림</h1>
            <div className="text-s mt-2 flex items-center gap-2 text-gray-500">
              <p>최근 업데이트된 소식을 확인하세요.</p>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              *알림은 최대 50개까지 7일간 보관됩니다.
            </p>
          </div>

          {/* 모두 읽음 버튼 */}
          <button
            onClick={() => markAllAsRead()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-300 transition-all hover:bg-gray-50 hover:text-blue-600 active:scale-95"
          >
            <Check size={16} />
            모두 읽음
          </button>
        </div>

        {/* 탭 */}
        <div className="mb-5 flex gap-2 border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 알림 리스트 영역 */}
        <div className="h-auto overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((noti) => (
                <NotificationItem
                  key={noti.id}
                  notification={noti}
                  onClick={() => handleNotificationClick(noti)}
                  isMenu={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                새로운 알림이 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                모든 소식을 확인하셨습니다!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default NotificationPage
