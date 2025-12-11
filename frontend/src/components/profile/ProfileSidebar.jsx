import { Activity, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'
import {
  ActivityIcon,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  SquareActivity,
  User,
} from 'lucide-react'

export default function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(true) // 토글 상태
  const { logout } = useAuthMutations()

  const menu = [
    {
      label: '대시보드',
      path: '/dashboard',
      icon: <LayoutDashboard size={24} />,
    },
    {
      label: '프로필 홈',
      path: '/profile',
      end: true, // 프로필 홈(/profile) 하위 경로(/profile/security 등)에서는 활성화되지 않게 함
      icon: <User size={24} />,
    },
    {
      label: '활동 내역',
      path: '/profile/activity',
      icon: <SquareActivity size={24} />,
    },
    {
      label: '보안 설정',
      path: '/profile/security',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: '알림 설정',
      path: '/profile/notifications',
      icon: <Bell size={24} />,
    },
  ]

  return (
    <>
      {/* Sticky & Fixed
      - sticky top-0 : 스크롤 시 상단에 고정되어 따라옴
      - h-screen: 화면 전체 높이 차지
      */}
      <aside
        className={`sticky top-0 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64 p-5' : 'w-20 p-3'}`}
      >
        {/* 토글 버튼 */}
        <div
          className={`mb-8 flex items-center ${
            isOpen ? 'justify-between' : 'justify-center'
          }`}
        >
          {isOpen && (
            <h3 className="ml-1 text-xl font-bold text-gray-800">메뉴</h3>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100"
          >
            {/* 열림/닫힘 전환 아이콘 */}
            {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end} // 프로필 홈이 하위 경로에서 활성화되지 않게 설정
              title={!isOpen ? item.label : ''} // 닫혔을 땐 아이콘만 보이게
              className={
                ({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-200 font-semibold text-gray-900'
                      : 'text-gray-600 hover:bg-gray-200'
                  } ${!isOpen && 'justify-center px-0'}` // 닫혔을 땐 가운데 정렬
              }
            >
              {/* 아이콘 크기 고정 */}
              <span className="shrink-0">{item.icon}</span>

              {/* 텍스트는 열렸을 때만 보임 */}
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'hidden opacity-0'}`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
          {/* 로그아웃 */}
          <button
            title={!isOpen ? '로그아웃' : ''}
            onClick={logout}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100 ${!isOpen && 'justify-center px-0'} `}
          >
            <LogOut size={24} />
            {isOpen && <span>로그아웃</span>}
          </button>
        </nav>
      </aside>
    </>
  )
}
