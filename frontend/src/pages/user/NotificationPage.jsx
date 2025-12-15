import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationQuery } from '../../hooks/notification/useNotificationQuery'
import { useNotificationMutations } from '../../hooks/notification/useNotificationMutations'
import { Bell, Check } from 'lucide-react'
import NotificationItem from '../../components/common/NotificationItem'

// 메인 알림 페이지
function NotificationPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ALL')

  // 탭 목록
  const tabs = [
    { id: 'ALL', label: '전체' },
    { id: 'CARD_ASSIGNED', label: '할당됨' },
    { id: 'COMMENT_ALL', label: '댓글' }, // 댓글/답글/멘션 통합
    { id: 'TEAM_INVITE', label: '초대' },
  ]

  // 데이터 연동
  const { notifications, isLoading } = useNotificationQuery()
  const { markAsRead, markAllAsRead } = useNotificationMutations()

  // 필터링 로직
  const filteredNotifications = notifications.filter((noti) => {
    if (activeTab === 'ALL') return true

    // '댓글' 탭 선택 시: 타입 이름에 'COMMENT'가 포함된 모든 알림 필터링
    if (activeTab === 'COMMENT_ALL') {
      return noti.type && noti.type.includes('COMMENT')
    }

    return noti.type === activeTab
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
    <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 영역 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">알림</h1>
            <p className="mt-2 text-sm text-gray-500">
              최근 업데이트된 소식을 확인하세요.
            </p>
          </div>

          {/* 모두 읽음 버튼 */}
          <button
            onClick={() => markAllAsRead()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-300 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          >
            <Check size={16} />
            모두 읽음
          </button>
        </div>

        {/* 탭 */}
        <div className="mb-6 flex gap-2 border-b border-gray-300 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors hover:cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
              )}
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
