import React, { Activity } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'
import defaultProfile from '../../assets/images/default.png'
import {
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import {
  ActivityIcon,
  CreditCard,
  HelpCircle,
  LogOut,
  Palette,
  Settings,
  User,
} from 'lucide-react'

function ProfileMenu({ onClose, anchorEl }) {
  const navigate = useNavigate()
  const { logout } = useAuthMutations()
  const { data: user } = useAuthQuery()

  // Floating UI 설정
  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose()
    },
    middleware: [
      offset({ mainAxis: 8, crossAxis: 50 }),
      flip(),
      shift({ padding: 10 }),
    ],
    placement: 'bottom-end',
    elements: { reference: anchorEl },
  })

  const { getFloatingProps } = useInteractions([useDismiss(context)])

  const handleLogout = () => {
    logout()
    onClose()
  }

  // 메뉴 이동 헬퍼
  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="animate-in fade-in z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      {/* 사용자 정보 요약 */}
      <div className="flex items-center gap-3 rounded-t-xl border-b border-gray-100 bg-gray-50/50 px-4 py-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
          <img
            src={user?.profileImg || defaultProfile}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {user?.nickname || '사용자'}
          </p>
          <p className="truncate text-xs text-gray-500">
            {user?.email || '이메일 없음'}
          </p>
        </div>
      </div>

      {/* --- 2. 메뉴 섹션 --- */}
      <div className="p-2">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleNavigate('/profile')}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <User size={20} className="text-gray-500" />
            <span>내 프로필</span>
          </button>

          <button
            onClick={() => handleNavigate('/profile/activity')}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ActivityIcon size={20} className="text-gray-500" />
            <span>내 활동</span>
          </button>

          <button
            // 아직 경로가 없다면 임시 처리
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <CreditCard size={20} className="text-gray-500" />
            <span>내 카드</span>
          </button>

          <button
            onClick={() => handleNavigate('/profile/security')}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Settings size={20} className="text-gray-500" />
            <span>설정</span>
          </button>
        </div>
      </div>

      <div className="mx-2 my-1 h-px bg-gray-100" />

      {/* 3. 추가 기능 섹션 */}
      <div className="p-2">
        <div className="flex flex-col gap-1">
          <button className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
            <Palette size={20} className="text-gray-500" />
            <span>테마 변경</span>
          </button>
          <button
            onClick={() => navigate('/support')}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <HelpCircle size={20} className="text-gray-500" />
            <span>문의하기</span>
          </button>
        </div>
      </div>

      <div className="mx-2 my-1 h-px bg-gray-100" />

      {/* --- 4. 로그아웃 --- */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
