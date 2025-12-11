import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'
import defaultProfile from '../../assets/images/default.png'

function ProfileMenu({ onClose }) {
  const menuRef = useRef(null)
  const { data: user } = useAuthQuery()
  const { logout } = useAuthMutations()

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.() // onClose가 있으면 실행
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      // 드롭다운 메뉴 컨테이너
      className="absolute top-14 right-4 z-50 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
    >
      {/* --- 1. ACCOUNT 섹션 --- */}
      <div className="px-3 pt-2 pb-3">
        <span className="text-xs font-semibold text-gray-500">사용자</span>
        {/* 사용자 정보 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
            {user?.profileImg ? (
              <img
                src={user.profileImg}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={defaultProfile}
                alt="Default Profile"
                className="h-full w-full object-cover opacity-50"
              />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">{user?.nickname}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>
      </div>

      <hr className="my-1 border-gray-200" />

      {/* --- 2. 메뉴 섹션 --- */}
      <div className="px-3 pt-2 pb-3">
        <div className="space-y-1">
          <Link
            to={'profile'}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            내 프로필
          </Link>
          <Link
            to={'profile/activity'}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            내 활동
          </Link>
          <Link className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
            내 카드
          </Link>
          <Link className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
            설정
          </Link>
        </div>
      </div>

      <hr className="my-1 border-gray-200" />

      {/* --- 3. 추가 기능 섹션 --- */}
      <div className="px-3 pt-2 pb-3">
        <div className="space-y-1">
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            테마 변경
          </button>
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            고객센터
          </button>
        </div>
      </div>

      <hr className="my-1 border-gray-200" />

      {/* --- 4. 로그아웃 --- */}
      <div className="px-3 pt-2 pb-2">
        <button
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-red-600 hover:cursor-pointer hover:bg-red-100"
          onClick={logout}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
