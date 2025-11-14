import React, { useState } from 'react'

// ------------------------------------
// 가짜(Mock) 데이터 (4개로 축소 및 'invitation' 타입 추가)
// ------------------------------------
const mockNotificationGroups = [
  {
    id: 1,
    card: {
      title: '로그인 페이지 UI 디자인',
      list: 'In Progress',
      board: 'Syncle Project',
      assigneeAvatar: 'https://avatar.vercel.sh/user1.png',
      watchCount: 1,
      commentCount: 2,
      checklistProgress: '1/2',
    },
    updates: [
      {
        id: 101,
        type: 'comment', // 댓글
        user: { name: '한윤아', avatar: 'https://avatar.vercel.sh/yoon.png' },
        action: '님이 댓글을 남겼습니다:',
        text: '@박성철 님, 시안 확인 부탁드립니다.',
        timestamp: '15 minutes ago',
      },
    ],
  },
  {
    id: 2,
    card: {
      title: 'Syncle 팀 보드',
      list: 'General',
      board: 'Syncle Team',
      assigneeAvatar: null,
      watchCount: 5,
      commentCount: 0,
      checklistProgress: '0/0',
    },
    updates: [
      {
        id: 201,
        type: 'invitation', // ★★★ 팀 초대 ★★★
        user: { name: '박성철', avatar: 'https://avatar.vercel.sh/sung.png' },
        action: "님이 당신을 'Syncle Team'에 초대했습니다.",
        text: null,
        timestamp: '1 hour ago',
      },
    ],
  },
  {
    id: 3,
    card: {
      title: 'API 엔드포인트 설계',
      list: 'Done',
      board: 'Backend System',
      assigneeAvatar: 'https://avatar.vercel.sh/user2.png',
      watchCount: 2,
      commentCount: 1,
      checklistProgress: '3/3',
    },
    updates: [
      {
        id: 301,
        type: 'action', // 일반 활동
        user: { name: '김영희', avatar: 'https://avatar.vercel.sh/kim.png' },
        action: '님이 이 카드를 In Progress에서 Done으로 옮겼습니다.',
        text: null,
        timestamp: '3 hours ago',
      },
      {
        id: 302,
        type: 'action', // 일반 활동
        user: { name: '김영희', avatar: 'https://avatar.vercel.sh/kim.png' },
        action: '님이 당신을 이 카드의 담당자로 배정했습니다.',
        text: null,
        timestamp: '3 hours ago',
      },
    ],
  },
  {
    id: 4,
    card: {
      title: '시스템 점검',
      list: 'To Do',
      board: 'Infra Team',
      assigneeAvatar: 'https://avatar.vercel.sh/sys.png',
      watchCount: 0,
      commentCount: 0,
      checklistProgress: '0/0',
    },
    updates: [
      {
        id: 401,
        type: 'system', // 시스템 알림
        user: { name: 'System', avatar: 'https://avatar.vercel.sh/sys.png' },
        action: '시스템 점검 알림:',
        text: '서버 점검이 1시간 뒤에 예정되어 있습니다.',
        timestamp: '1 day ago',
      },
    ],
  },
]

// ------------------------------------
// 개별 활동 아이템 컴포넌트 (댓글, 이동, 초대 등)
// ------------------------------------
function ActivityItem({ update }) {
  // 알림 타입에 따라 다른 버튼을 렌더링
  const renderActionButtons = () => {
    switch (update.type) {
      case 'invitation':
        return (
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              수락
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              거절
            </button>
          </div>
        )
      case 'comment':
      case 'action':
        return (
          <div className="mt-3 flex items-center gap-4">
            <button className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Reply
            </button>
          </div>
        )
      case 'system':
      default:
        return null // 시스템 알림 등에는 버튼 없음
    }
  }

  return (
    <div className="flex gap-3 border-t border-gray-200 p-4">
      {/* 사용자 아바타 */}
      <img
        className="h-10 w-10 flex-shrink-0 rounded-full"
        src={update.user.avatar}
        alt={update.user.name}
      />
      <div className="flex-1">
        {/* 활동 내용 */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-semibold">{update.user.name}</span>
            <span className="ml-1 text-gray-600">{update.action}</span>
          </div>
          <span className="text-xs text-gray-400">{update.timestamp}</span>
        </div>

        {/* 댓글/첨부파일/시스템 메시지 내용 (있을 경우) */}
        {update.text && (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm">
            <p className="text-sm text-gray-800">{update.text}</p>
          </div>
        )}

        {/* 하단 버튼 (초대/댓글) */}
        {renderActionButtons()}
      </div>
    </div>
  )
}

// ------------------------------------
// 활동이 발생한 카드 정보 헤더
// ------------------------------------
function CardHeader({ card }) {
  // 담당자 아바타가 있을 때만 렌더링
  const renderAssignee = () => {
    if (!card.assigneeAvatar) return null
    return (
      <img
        className="h-8 w-8 rounded-full"
        src={card.assigneeAvatar}
        alt="assignee"
        title="담당자"
      />
    )
  }

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      {/* 카드 제목 및 담당자 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
        {renderAssignee()}
      </div>

      {/* 보드/리스트 위치 정보 */}
      <div className="mt-1 text-sm text-gray-500">
        on board{' '}
        <span className="font-semibold text-gray-700">{card.board}</span> in
        list <span className="font-semibold text-gray-700">{card.list}</span>
      </div>

      {/* 메타데이터 (아이콘들) */}
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1" title="구독자">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.07.207-.141.414-.217.618M15 10a3 3 0 01-3 3"
            />
          </svg>
          <span>{card.watchCount}</span>
        </div>
        <div className="flex items-center gap-1" title="댓글">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{card.commentCount}</span>
        </div>
        <div className="flex items-center gap-1" title="체크리스트">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{card.checklistProgress}</span>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------
// 메인 알림 페이지
// ------------------------------------
function NotificationPage() {
  const [activeTab, setActiveTab] = useState('전체')
  const tabs = ['전체', '멘션', '팀 초대', '시스템']

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">알림</h1>

        {/* 탭 */}
        <div className="mt-6 mb-6 flex gap-2 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50'
              } `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 알림 그룹 리스트 */}
        <div className="space-y-6">
          {mockNotificationGroups.map((group) => (
            // 알림 카드 한 묶음
            <div
              key={group.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              {/* 상단 카드 정보 */}
              <CardHeader card={group.card} />

              {/* 하단 활동 내역 */}
              <div>
                {group.updates.map((update) => (
                  <ActivityItem key={update.id} update={update} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default NotificationPage
