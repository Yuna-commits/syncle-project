import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useUserStore from '../../stores/useUserStore'

function ProfileMenu({ onClose }) {
  const menuRef = useRef(null)
  const { user, logout } = useUserStore()

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
        <span className="text-xs font-semibold text-gray-500">ACCOUNT</span>
        {/* 사용자 정보 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            박
          </div>
          <div>
            <div className="text-sm font-semibold">{user?.nickname}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
      </div>

      <hr className="my-1 border-gray-200" />

      {/* --- 2. 메뉴 섹션 --- */}
      <div className="px-3 pt-2 pb-3">
        <div className="space-y-1">
          <Link
            to={'profile'}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            내 프로필
          </Link>
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            내 활동
          </button>
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            내 카드
          </button>
          {/* '계정 설정' -> '설정'으로 이름 변경 */}
          <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            설정
          </button>
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
          className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
