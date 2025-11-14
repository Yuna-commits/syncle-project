import React, { useEffect, useRef } from 'react'

function NotificationMenu({ onClose }) {
  const modalRef = useRef(null)

  // --- 메뉴 외부 클릭 감지 ---
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={modalRef}
      className="absolute top-13 right-2 z-50 w-96 rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      {/* 상단 영역 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="ml-2 text-lg font-semibold">알림</h2>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={onClose}
        >
          모두 읽음 처리
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 px-4 py-2 pt-4 text-sm">
        <button className="rounded-md bg-blue-600 px-3 py-1 text-white">
          전체
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
          멘션
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
          팀 초대
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-1 text-gray-700">
          시스템
        </button>
      </div>

      {/* 알림 리스트 */}
      <div className="max-h-96 overflow-y-auto pb-2">
        {/* 알림 1 */}
        <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1">
            <p>
              <span className="font-semibold">@철수</span> 님이 당신을
              <span className="font-semibold"> 팀에 초대했습니다.</span>
            </p>
            <span className="text-xs text-gray-500">3분 전</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>

        {/* 알림 2 */}
        <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1">
            <p>
              <span className="font-semibold">@영희</span> 님이 댓글을
              남겼습니다.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              "오늘 회의 언제 가능하세요?"
            </p>
            <span className="text-xs text-gray-500">1시간 전</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>

        {/* 알림 3 */}
        <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1">
            <p>
              <span className="font-semibold">@관리자</span> 새로운 업데이트가
              적용되었습니다.
            </p>
            <span className="text-xs text-gray-500">어제</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationMenu
