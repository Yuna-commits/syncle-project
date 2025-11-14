import { NavLink } from 'react-router-dom'

export default function ProfileSidebar() {
  const menu = [
    {
      label: '대시보드',
      path: '/dashboard',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      label: '프로필 홈',
      path: '/profile',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 20c0-4 3-7 6.5-7s6.5 3 6.5 7" />
        </svg>
      ),
    },
    {
      label: '보안 설정',
      path: '/profile/security',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z" />
        </svg>
      ),
    },
    {
      label: '알림',
      path: '/profile/notifications',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
    },
    {
      label: '활동 내역',
      path: '/profile/activity',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19h16M4 15h10M4 11h7M4 7h12M4 3h5" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="min-h-screen w-60 border-r border-gray-300 bg-white p-5">
      <h3 className="mb-6 text-xl font-semibold text-gray-800">메뉴</h3>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-gray-200 font-semibold text-gray-900'
                  : 'text-gray-600 hover:bg-gray-200'
              } `
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        {/* 로그아웃 */}
        <button className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:cursor-pointer hover:bg-red-50">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          로그아웃
        </button>
      </nav>
    </aside>
  )
}
