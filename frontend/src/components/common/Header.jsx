import { Bell, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import defaultProfile from '../../assets/images/default.png'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useNotificationQuery } from '../../hooks/notification/useNotificationQuery'
import useUiStore from '../../stores/useUiStore'
import NotificationMenu from '../modals/NotificationMenu'
import ProfileMenu from '../modals/ProfileMenu'

function Header({ onOpenTeamModal }) {
  // 알림 데이터 조회
  // 소켓이 알림을 받으면 'notifications' 쿼리를 무효화시키고,
  // 자동으로 최신 데이터를 가져와 unreadCount 갱신
  const { unreadCount } = useNotificationQuery()

  const { data: user } = useAuthQuery()
  const { activeMenu, toggleMenu, closeAll } = useUiStore()
  const location = useLocation()

  const [notiAnchor, setNotiAnchor] = useState(null)
  const [profileAnchor, setProfileAnchor] = useState(null)

  useEffect(() => {
    // 경로가 바뀔 때마다 모든 메뉴 닫기
    closeAll()
  }, [location.pathname, closeAll])

  // 알림 아이콘 클릭
  const handleNotiClick = (e) => {
    e.stopPropagation()
    setNotiAnchor(e.currentTarget)
    toggleMenu('notification')
  }

  // 프로필 아이콘 클릭
  const handleProfileClick = (e) => {
    e.stopPropagation()
    setProfileAnchor(e.currentTarget)
    toggleMenu('profile')
  }

  return (
    <nav className="relative z-50 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* ---------------- 좌측: 로고 ---------------- */}
      <Link to="dashboard" className="flex items-center gap-3">
        {/* 서비스 로고 */}
        <span className="text-xl font-bold tracking-tight text-gray-800">
          Syncle
        </span>
      </Link>
      {/* ---------------- 가운데: 검색 + 팀 생성 ---------------- */}
      <div className="flex w-full max-w-xl items-center gap-4 px-4">
        {/* 검색창 */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="검색어를 입력해주세요."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Create 버튼 */}
        <button
          onClick={onOpenTeamModal}
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:cursor-pointer hover:bg-blue-700 hover:shadow-md active:scale-95 md:flex"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>팀 생성</span>
        </button>
      </div>
      {/* ---------------- 우측 아이콘들 ---------------- */}
      <div className="flex items-center gap-4">
        {/* 알림 아이콘 */}
        <div className="relative">
          <button
            onClick={handleNotiClick}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:cursor-pointer ${
              activeMenu === 'notification'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Bell size={22} strokeWidth={2} />

            {/* 읽지 않은 알림 배지 */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 알림 메뉴 드롭다운 */}
          {activeMenu === 'notification' && (
            <NotificationMenu
              onClose={closeAll}
              anchorEl={notiAnchor} // Floating UI 사용 시 필요
            />
          )}
        </div>

        {/* 프로필 아이콘 영역 */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className={`mt-1 h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 transition-all hover:cursor-pointer ${
              activeMenu === 'profile'
                ? 'border-blue-500 ring-2 ring-blue-100'
                : 'border-white shadow-sm hover:border-gray-200'
            }`}
          >
            <img
              src={user?.profileImg || defaultProfile}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </button>

          {/* 프로필 메뉴 드롭다운 (컴포넌트가 있다면 추가) */}
          {activeMenu === 'profile' && (
            <ProfileMenu onClose={closeAll} anchorEl={profileAnchor} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header
