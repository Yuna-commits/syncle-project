import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import useUserStore from '../../stores/useUserStore'

export default function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(true) // 토글 상태
  const { logout } = useUserStore()

  const menu = [
    {
      label: '대시보드',
      path: '/dashboard',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
    },
    {
      label: '프로필 홈',
      path: '/profile',
      end: true, // 프로필 홈(/profile) 하위 경로(/profile/security 등)에서는 활성화되지 않게 함
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      label: '보안 설정',
      path: '/profile/security',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      label: '알림 설정',
      path: '/profile/notifications',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      ),
    },
    {
      label: '활동 내역',
      path: '/profile/activity',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      ),
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
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            {isOpen && <span>로그아웃</span>}
          </button>
        </nav>
      </aside>
    </>
  )
}
