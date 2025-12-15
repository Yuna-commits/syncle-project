import {
  ArrowRight,
  Bell,
  CheckSquare,
  Clock,
  MessageSquareCode,
  User,
  UserPlus,
} from 'lucide-react'
import defaultProfile from '../../assets/images/default.png'

// 개별 알림 아이템 컴포넌트
export default function NotificationItem({ notification, onClick }) {
  const { senderNickname, senderProfileImg, message, createdAt, isRead, type } =
    notification

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
    switch (type) {
      case 'COMMENT': // 댓글
      case 'COMMENT_REPLY': // 답글
      case 'COMMENT_TAGGED': // 멘션
        return {
          icon: <MessageSquareCode size={14} />,
          color: 'text-blue-600 bg-blue-50',
          label: type === 'COMMENT' ? '댓글' : '답글',
        }
      case 'CARD_ASSIGNED': // 담당자 지정
        return {
          icon: <User size={14} />,
          color: 'text-green-600 bg-green-50',
          label: '할당',
        }
      case 'CARD_MOVED': // 카드 이동
        return {
          icon: <ArrowRight size={14} />,
          color: 'text-purple-600 bg-purple-50',
          label: '이동',
        }
      case 'CARD_UPDATED': // 카드 수정
        return {
          icon: <CheckSquare size={14} />,
          color: 'text-orange-600 bg-orange-50',
          label: '수정',
        }
      case 'DEADLINE_NEAR': // 마감 임박
        return {
          icon: <Clock size={14} />,
          color: 'text-red-600 bg-red-50',
          label: '마감임박',
        }
      case 'TEAM_INVITE': // 팀 초대
        return {
          icon: <UserPlus size={14} />,
          color: 'text-indigo-600 bg-indigo-50',
          label: '초대',
        }
      default:
        return {
          icon: <Bell size={14} />,
          color: 'text-gray-600 bg-gray-50',
          label: '알림',
        }
    }
  }

  const typeConfig = getTypeConfig()

  const renderMessageContent = () => {
    // 댓글/답글/멘션 타입인 경우 '알림 문구'와 '내용'을 분리
    if (
      type === 'COMMENT' ||
      type === 'COMMENT_REPLY' ||
      type === 'COMMENT_TAGGED'
    ) {
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
            <div className="mt-1.5 border-l-2 border-gray-300 p-2 text-sm whitespace-pre-wrap text-gray-500">
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
      onClick={onClick}
      className={`group flex cursor-pointer items-start gap-4 border-b border-gray-100 p-5 transition-colors last:border-0 hover:bg-blue-50 ${
        !isRead ? 'bg-blue-50/40' : 'bg-white'
      }`}
    >
      {/* 프로필 이미지 */}
      <div className="relative shrink-0">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <img
            src={senderProfileImg || defaultProfile}
            alt={senderNickname || '알 수 없음'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.classList.add(
                'flex',
                'items-center',
                'justify-center',
              )
            }}
          />
        </div>

        {/* 읽지 않음 표시 (파란 점) */}
        {!isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm"></span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* 2. 헤더: 이름 + 시간 + 아이콘 */}
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">
              {senderNickname || '알 수 없음'}
            </span>
            {/* 타입 아이콘 배지 */}
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeConfig.color}`}
            >
              {typeConfig.icon}
              <span>{typeConfig.label}</span>
            </div>
          </div>
          <span className="shrink-0 text-xs whitespace-nowrap text-gray-400">
            {formatTime(createdAt)}
          </span>
        </div>

        {/* 3. 메시지 본문 */}
        {renderMessageContent()}
      </div>
    </div>
  )
}
