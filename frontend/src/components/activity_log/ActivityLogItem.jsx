import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import React from 'react'
import {
  PlusCircle,
  Edit3,
  Trash2,
  MessageSquare,
  CheckSquare,
  UserPlus,
  UserMinus,
  UserCog,
  LogOut,
  LogIn,
  Settings,
  Layout,
  Users,
  FileText,
  XCircle,
} from 'lucide-react'

// variant: 'timeline' (개인 프로필용) | 'avatar' (팀/보드용)
export default function ActivityLogItem({ log, variant = 'timeline' }) {
  // 1. 활동 타입별 스타일 및 아이콘 매핑
  const getTypeStyle = (type) => {
    switch (type) {
      case 'CREATE_CARD':
      case 'CREATE_LIST':
      case 'CREATE_BOARD':
      case 'CREATE_TEAM':
      case 'JOIN_BOARD':
      case 'ACCEPT_INVITE':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200',
          icon: <PlusCircle />,
        }
      case 'UPDATE_CARD':
      case 'UPDATE_BOARD':
      case 'UPDATE_BOARD_SETTINGS':
      case 'UPDATE_TEAM':
      case 'UPDATE_LIST':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200',
          icon: <Edit3 />,
        }
      case 'INVITE_MEMBER':
      case 'UPDATE_MEMBER_ROLE':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          border: 'border-purple-200',
          icon: <UserCog />,
        }
      case 'ADD_COMMENT':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          icon: <MessageSquare />,
        }
      case 'CHECKLIST_COMPLETED':
        return {
          bg: 'bg-teal-100',
          text: 'text-teal-600',
          border: 'border-teal-200',
          icon: <CheckSquare />,
        }
      case 'DELETE_BOARD':
      case 'DELETE_LIST':
      case 'DELETE_TEAM':
      case 'KICK_MEMBER':
      case 'REJECT_INVITE':
      case 'LEAVE_TEAM':
      case 'LEAVE_BOARD':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          border: 'border-red-200',
          icon: <Trash2 />,
        }
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-500',
          border: 'border-gray-200',
          icon: <FileText />,
        }
    }
  }

  // 2. 활동 위치(Context) 정보 매핑 (보드 vs 팀 vs 시스템)
  const getContextInfo = () => {
    // 보드 ID나 제목이 있으면 '보드' 활동으로 간주
    if (log.boardTitle) {
      return {
        type: '보드',
        name: log.boardTitle,
        icon: <Layout className="h-3.5 w-3.5" />,
        className: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
      }
    }
    // 보드는 없고 팀 정보만 있으면 '팀' 활동으로 간주
    if (log.teamName) {
      return {
        type: '팀',
        name: log.teamName,
        icon: <Users className="h-3.5 w-3.5" />,
        className:
          'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
      }
    }
    // 그 외
    return {
      type: '시스템',
      name: 'System',
      icon: <Settings className="h-3.5 w-3.5" />,
      className: 'bg-slate-50 text-slate-600 border-slate-100',
    }
  }

  const style = getTypeStyle(log.type)
  const context = getContextInfo()

  // 스타일 1: 개인 프로필용
  if (variant === 'timeline') {
    return (
      <div className="group relative pb-1 pl-14">
        {/* 타임라인 수직선 */}
        <div
          className="absolute top-3 bottom-0 left-[23px] w-0.5 bg-gray-200 group-last:hidden"
          aria-hidden="true"
        />

        {/* 타입 아이콘 (확대됨) */}
        <div
          className={`absolute top-0 left-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white ${style.bg} ${style.text} z-10 shadow-sm transition-transform group-hover:scale-105`}
        >
          {React.cloneElement(style.icon, { className: 'w-5 h-5' })}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex flex-col gap-2 border-b border-gray-100 pt-1.5 pb-5 group-last:border-0 group-last:pb-0">
          {/* 헤더: 위치 배지 + 시간 */}
          <div className="flex items-center gap-2">
            {/* 위치 정보 배지 (아이콘 + 이름 + 색상 구분) */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${context.className}`}
            >
              {context.icon}
              <span className="font-bold">{context.name}</span>
            </div>

            <span className="text-xs text-gray-300">|</span>

            {/* 시간 */}
            <span className="text-xs font-medium text-gray-400">
              {formatDistanceToNow(new Date(log.createdDate || log.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>

          {/* 본문 메시지 */}
          <p className="text-[15px] leading-relaxed font-medium text-gray-800">
            {log.description}
          </p>
        </div>
      </div>
    )
  }

  // 스타일 2: 팀/보드 활동 로그용
  return (
    <div className="flex gap-4 rounded-lg border-b border-gray-50 px-4 py-4 transition-colors last:border-0 hover:bg-gray-50/50">
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-600">
          {log.actorName ? log.actorName.charAt(0).toUpperCase() : '?'}
        </div>
        <div
          className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${style.bg} ${style.text}`}
        >
          {React.cloneElement(style.icon, { className: 'w-3 h-3' })}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {log.actorName}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(log.createdDate || log.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-gray-600">
          {log.description}
        </p>

        {/* 아바타 뷰에서도 컨텍스트 구분 적용 */}
        <div
          className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${context.type === '보드' ? 'text-blue-600' : 'text-indigo-600'}`}
        >
          {context.icon}
          {context.name}
        </div>
      </div>
    </div>
  )
}
