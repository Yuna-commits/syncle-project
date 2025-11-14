import React from 'react'

// ------------------------------------
// 가짜(Mock) 데이터
// ------------------------------------
// 실제로는 API로 받아올 데이터입니다.
const notificationGroups = [
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
        user: {
          name: '박성철',
          avatar: 'https://avatar.vercel.sh/sung.png',
        },
        action: '님이 댓글을 남겼습니다:',
        text: '테스트 댓글입니다. @한윤아 님 확인 부탁드려요.',
        timestamp: '21 hours ago',
      },
      {
        id: 102,
        user: {
          name: '한윤아',
          avatar: 'https://avatar.vercel.sh/yoon.png',
        },
        action: '님이 이 카드를 ToDo에서 In Progress로 옮겼습니다.',
        text: null,
        timestamp: '22 hours ago',
      },
    ],
  },
  {
    id: 2,
    card: {
      title: 'API 엔드포인트 설계',
      list: 'Done',
      board: 'Syncle Project',
      assigneeAvatar: 'https://avatar.vercel.sh/user2.png',
      watchCount: 2,
      commentCount: 1,
      checklistProgress: '3/3',
    },
    updates: [
      {
        id: 103,
        user: {
          name: '김영희',
          avatar: 'https://avatar.vercel.sh/kim.png',
        },
        action: '님이 당신을 이 카드에 담당자로 배정했습니다.',
        text: null,
        timestamp: '2 days ago',
      },
    ],
  },
]

// ------------------------------------
// 개별 활동 아이템 컴포넌트 (댓글, 이동 등)
// ------------------------------------
function ActivityItem({ update }) {
  return (
    <div className="flex gap-3 border-t p-4">
      {/* 사용자 아바타 */}
      <img
        className="h-10 w-10 rounded-full"
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

        {/* 댓글 내용 (있을 경우) */}
        {update.text && (
          <div className="mt-2 rounded-md border bg-gray-50 p-3 shadow-sm">
            <p className="text-sm">{update.text}</p>
          </div>
        )}

        {/* 하단 버튼 (Reply 등) */}
        <div className="mt-3 flex items-center gap-4">
          <button className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <svg
              className="mr-1.5 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10h10a8 8 0 018 8v2M3 10L7 6m-4 4l4 4"
              />
            </svg>
            Reply
          </button>
          {/* ...다른 리액션 버튼... */}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------
// 활동이 발생한 카드 정보 헤더
// ------------------------------------
function CardHeader({ card }) {
  return (
    <div className="rounded-t-lg border-b bg-white p-4">
      {/* 카드 제목 및 담당자 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
        <img
          className="h-8 w-8 rounded-full ring-2 ring-white"
          src={card.assigneeAvatar}
          alt="assignee"
        />
      </div>

      {/* 보드/리스트 위치 정보 (트렐로의 'test: test' 부분) */}
      <div className="mt-1 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
        on board <span className="font-semibold">{card.board}</span> in list{' '}
        <span className="font-semibold">{card.list}</span>
      </div>

      {/* 메타데이터 (아이콘들) */}
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-1">
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
  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">알림</h1>

        {/* 탭 (NotificationModal에서 가져옴) */}
        <div className="mt-6 mb-6 flex gap-2 text-sm">
          <button className="rounded-md bg-blue-600 px-3 py-1.5 text-white">
            전체
          </button>
          <button className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50">
            멘션
          </button>
          <button className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50">
            팀 초대
          </button>
          <button className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50">
            시스템
          </button>
        </div>

        {/* 알림 그룹 리스트 */}
        <div className="space-y-6">
          {notificationGroups.map((group) => (
            // 알림 카드 한 묶음
            <div
              key={group.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
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
