import {
  ArrowRight,
  AtSign,
  Bell,
  CheckSquare,
  Clock,
  KanbanSquare,
  ListChecks,
  MessageSquareCode,
  User,
  UserPlus,
} from 'lucide-react'
import defaultProfile from '../../assets/images/default.png'
import { useState } from 'react'
import { useInvitationMutations } from '../../hooks/team/useInvitationMutations'
import { useNavigate } from 'react-router-dom'
import { useNotificationMutations } from '../../hooks/notification/useNotificationMutations'

// 개별 알림 아이템 컴포넌트
export default function NotificationItem({
  notification,
  onClose,
  onClick,
  isMenu = false,
}) {
  const { acceptInvitation, rejectInvitation } = useInvitationMutations()
  const [processed, setProcessed] = useState(false) // 처리 여부
  const { markAsRead } = useNotificationMutations() // 읽음 처리 함수
  const navigate = useNavigate()

  // 날짜 포맷팅 (ex: 5분 전)
  const formatTime = (dateData) => {
    if (!dateData) return ''

    let date
    if (Array.isArray(dateData)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateData
      // Date 객체의 Month는 0부터 시작
      date = new Date(year, month - 1, day, hour, minute, second)
    } else {
      date = new Date(dateData)
    }

    const now = new Date()
    // (현재 시간 - 알림 시간)(ms) / 1분(ms)
    const diffMin = Math.floor((now - date) / (1000 * 60))

    if (diffMin < 1) return '방금 전'
    if (diffMin < 60) return `${diffMin}분 전`

    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}시간 전`

    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 알림 타입에 따른 아이콘/스타일
  const getTypeConfig = () => {
    switch (notification.type) {
      case 'COMMENT': // 댓글
      case 'COMMENT_REPLY': // 답글
        return {
          icon: <MessageSquareCode size={14} />,
          color: 'text-blue-600 bg-blue-50',
        }
      case 'MENTION': // 멘션
        return {
          icon: <AtSign size={14} />,
          color: 'text-cyan-600 bg-cyan-50',
        }
      case 'CARD_ASSIGNED': // 담당자 지정
        return {
          icon: <User size={14} />,
          color: 'text-green-600 bg-green-50',
        }
      case 'CARD_MOVED': // 카드 이동
        return {
          icon: <ArrowRight size={14} />,
          color: 'text-purple-600 bg-purple-50',
        }
      case 'CARD_UPDATED': // 카드 수정
        return {
          icon: <CheckSquare size={14} />,
          color: 'text-orange-600 bg-orange-50',
        }
      case 'CHECKLIST_COMPLETED':
        return {
          icon: <ListChecks size={14} />,
          color: 'text-emerald-600 bg-emerald-50',
        }
      case 'DEADLINE_NEAR': // 마감 임박
        return {
          icon: <Clock size={14} />,
          color: 'text-red-600 bg-red-50',
        }
      case 'TEAM_INVITE': // 팀 초대
        return {
          icon: <UserPlus size={14} />,
          color: 'text-indigo-600 bg-indigo-50',
        }
      case 'BOARD_INVITE': // 보드 초대
        return {
          icon: <KanbanSquare size={14} />,
          color: 'text-pink-600 bg-pink-50',
        }
      default:
        return {
          icon: <Bell size={14} />,
          color: 'text-gray-600 bg-gray-50',
        }
    }
  }

  const typeConfig = getTypeConfig()

  const renderMessageContent = () => {
    const { message, type } = notification
    // 댓글/답글/멘션 타입인 경우 '알림 문구'와 '내용'을 분리
    if (
      type.includes('COMMENT') ||
      type === 'MENTION' ||
      type === 'CHECKLIST_COMPLETED'
    ) {
      const separatorIndex = message.indexOf(':') // 첫 번째 ':' 위치 찾음

      if (separatorIndex > -1) {
        console.log(message)
        const titlePart = message.slice(0, separatorIndex)
        const contentPart = message.slice(separatorIndex + 1).trim()

        return (
          <div className="text-sm">
            {/* 알림 문구 (Bold 처리) */}
            <span className="text-medium font-semibold text-gray-700">
              {titlePart}
            </span>

            {/* 실제 내용 (줄바꿈 처리(whitespace-pre-wrap) + 박스 스타일) */}
            <div className="mt-1.5 border-l-2 border-gray-300 p-2 text-sm whitespace-pre-wrap text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-gray-600">
              {contentPart}
            </div>
          </div>
        )
      }
    }

    // 그 외 일반 알림
    return (
      <p className="border-l-2 border-gray-300 p-2 text-sm leading-relaxed break-keep whitespace-pre-wrap text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-gray-600">
        {message}
      </p>
    )
  }

  // 초대 수락/거절 핸들러
  const handleResponse = (e, action) => {
    e.stopPropagation()

    const options = {
      onSuccess: () => {
        // 처리 완료 상태로 변경
        setProcessed(true)
        markAsRead(notification.id) // 서버에 '읽음' 상태 저장
        // 수락인 경우에만 해당 팀 페이지로 이동
        if (action === 'ACCEPT' && notification.targetUrl) {
          navigate(notification.targetUrl)
          onClose?.()
        }
      },
    }

    if (action === 'ACCEPT') {
      // 수락 요청
      acceptInvitation(notification.token, options)
    } else {
      // 거절 요청
      rejectInvitation(notification.token, options)
    }
  }

  // 버튼 그룹 렌더링
  const renderButtons = () => {
    // 타입이 팀 초대가 아니거나, 로컬에서 처리됐거나, 서버에서 읽음 처리된 경우 숨김
    if (
      notification.type !== 'TEAM_INVITE' ||
      processed ||
      notification.isRead
    ) {
      return null
    }

    return (
      <div
        className={`flex gap-2 ${isMenu ? 'mt-2 w-full justify-end' : 'ml-4 shrink-0 self-center'}`}
      >
        <button
          onClick={(e) => handleResponse(e, 'REJECT')}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          거절
        </button>
        <button
          onClick={(e) => handleResponse(e, 'ACCEPT')}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-blue-700"
        >
          수락
        </button>
      </div>
    )
  }

  const isClickable = notification.type !== 'TEAM_INVITE'

  return (
    <li
      className={`relative flex items-start gap-3 border-b border-gray-100 p-4 transition-colors last:border-0 ${!notification.isRead ? 'bg-blue-50/40' : ''}`}
    >
      {/* 1. 좌측: 프로필 이미지 */}
      <div className="relative shrink-0 pt-1">
        <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <img
            src={notification.senderProfileImg || defaultProfile}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
        <div
          className={`absolute -right-1 -bottom-1 rounded-full bg-white p-0.5 shadow-sm`}
        >
          <div className={`rounded-full p-0.5 ${typeConfig.color}`}>
            {typeConfig.icon}
          </div>
        </div>
      </div>

      {/* 2. 우측: 컨텐츠 영역 */}
      <div className="min-w-0 flex-1">
        {/* [Header] 이름과 시간은 항상 최상단 양쪽 끝에 위치 */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="truncate text-xs font-bold text-gray-900">
              {notification.senderNickname || '알림'}
            </span>

            {!notification.isRead && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-blue-600 ring-1 ring-white"
                title="읽지 않음"
              ></span>
            )}
          </div>
          <span className="shrink-0 text-[12px] whitespace-nowrap text-gray-400">
            {formatTime(notification.createdAt)}
          </span>
        </div>

        {/* [Body] 메시지와 버튼 레이아웃 분기 */}
        <div
          className={`flex ${isMenu ? 'flex-col' : 'flex-row items-start justify-between'}`}
        >
          {/* 메시지 본문 */}
          <div
            onClick={(e) => {
              if (isClickable) {
                e.stopPropagation() // NotificationMenu로 클릭 이벤트 전파 방지
                onClick?.(notification)
                onClose?.()
              }
            }}
            className={`min-w-0 flex-1 ${
              isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
            }`}
          >
            {renderMessageContent()}
          </div>

          {/* 버튼 영역 */}
          {renderButtons()}

          {/* 처리 완료 메시지 */}
          {processed && (
            <div
              className={`text-xs text-gray-400 ${isMenu ? 'mt-1 text-right' : 'ml-4 self-center'}`}
            >
              처리 완료
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
