import React, { useEffect, useRef } from 'react'

function ProfileMenu({ onClose }) {
  const menuRef = useRef(null)

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="absolute top-11 right-0 w-60 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
    >
      {/* 상단 사용자 정보 */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="h-9 w-9 rounded-full bg-blue-500" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">박성철</span>
          <span className="text-xs text-gray-500">sungcheol@example.com</span>
        </div>
      </div>

      <div className="my-1 border-t" />

      {/* 메뉴 아이템들 */}
      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <span className="mr-2 text-lg">👤</span>내 프로필
      </button>

      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <span className="mr-2 text-lg">⚙️</span>
        계정 설정
      </button>

      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <span className="mr-2 text-lg">🔔</span>
        알림 설정
      </button>

      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <span className="mr-2 text-lg">👥</span>팀 전환
      </button>

      <div className="my-1 border-t" />

      <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
        <span className="mr-2 text-lg">🚪</span>
        로그아웃
      </button>
    </div>
  )
}

export default ProfileMenu
