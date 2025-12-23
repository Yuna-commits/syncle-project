import { Bell, Plus, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { boardApi } from '../../api/board.api'
import defaultProfile from '../../assets/images/default.png'
import logo from '../../assets/images/logo_v5.png'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useNotificationQuery } from '../../hooks/notification/useNotificationQuery'
import useUiStore from '../../stores/useUiStore'
import NotificationMenu from '../modals/NotificationMenu'
import ProfileMenu from '../modals/ProfileMenu'
import SearchDropdown from './SearchDropdown'

function Header({ onOpenTeamModal }) {
  const { unreadCount } = useNotificationQuery()
  const { data: user } = useAuthQuery()
  const { activeMenu, toggleMenu, closeAll } = useUiStore()

  const location = useLocation()
  const navigate = useNavigate()

  // 드롭다운 및 검색 상태 관리
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // 외부 클릭 감지를 위한 Ref
  const searchRef = useRef(null)

  const [notiAnchor, setNotiAnchor] = useState(null)
  const [profileAnchor, setProfileAnchor] = useState(null)

  useEffect(() => {
    closeAll()
  }, [location.pathname, closeAll])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색어 변경 시 API 호출
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!keyword.trim()) {
        setSearchResults([])
        setShowDropdown(false)
        return
      }

      setIsSearching(true)
      try {
        const res = await boardApi.searchBoards(keyword)
        setSearchResults(res.data.data)
        setShowDropdown(true)
      } catch (error) {
        console.error('검색 실패:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [keyword])

  // 검색 결과 클릭 핸들러
  const handleResultClick = (boardId) => {
    navigate(`/board/${boardId}`) // 해당 보드로 이동
    setKeyword('') // 검색어 초기화
    setShowDropdown(false) // 드롭다운 닫기
  }

  // ... (handleNotiClick, handleProfileClick 유지) ...
  const handleNotiClick = (e) => {
    e.stopPropagation()
    setNotiAnchor(e.currentTarget)
    toggleMenu('notification')
  }

  const handleProfileClick = (e) => {
    e.stopPropagation()
    setProfileAnchor(e.currentTarget)
    toggleMenu('profile')
  }

  return (
    <nav className="relative z-50 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* 좌측 로고 */}
      <Link to="dashboard" className="flex items-center gap-2">
        <img
          src={logo}
          alt="Syncle Logo"
          className="h-8 w-auto object-contain"
        />
        <span className="text-xl font-bold tracking-tight text-gray-800">
          Syncle
        </span>
      </Link>

      {/* ---------------- 가운데: 검색 + 팀 생성 ---------------- */}
      <div
        className="relative flex w-full max-w-xl items-center gap-4 px-4"
        ref={searchRef}
      >
        {/* 검색창 */}
        <div className="relative w-full">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => keyword.trim() && setShowDropdown(true)}
            placeholder="보드 검색..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-11 text-sm text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* 분리된 드롭다운 컴포넌트 사용 */}
        {showDropdown && (
          <SearchDropdown
            results={searchResults}
            isSearching={isSearching}
            onSelect={handleResultClick}
          />
        )}

        {/* Create 버튼 */}
        <button
          onClick={onOpenTeamModal}
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:cursor-pointer hover:bg-blue-700 hover:shadow-md active:scale-95 md:flex"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>팀 생성</span>
        </button>
      </div>

      {/* 우측 아이콘들 */}
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {activeMenu === 'notification' && (
            <NotificationMenu onClose={closeAll} anchorEl={notiAnchor} />
          )}
        </div>

        {/* 프로필 아이콘 */}
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
          {activeMenu === 'profile' && (
            <ProfileMenu onClose={closeAll} anchorEl={profileAnchor} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header
