import React from 'react'

function TeamCreateModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[520px] rounded-xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="mb-6 text-xl font-semibold text-gray-800">팀 생성</h2>

        {/* 팀 이름 입력 */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-gray-700"></label>
          <input
            type="text"
            placeholder="팀 이름을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* 팀 정보 입력 */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            rows={3}
            placeholder="팀에 대한 간단한 설명을 입력하세요 (선택)"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          ></textarea>
        </div>

        {/* 멤버 초대 섹션 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            멤버 초대
          </label>

          {/* 검색 인풋 */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="이메일 또는 이름으로 검색"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            {/* 돋보기 아이콘 */}
            <svg
              className="absolute top-2.5 right-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>

          {/* 초대된 멤버 리스트 */}
          <div className="h-28 overflow-y-auto rounded-lg border border-gray-200 bg-gray-200 p-3 text-sm text-gray-600">
            <p className="text-gray-400">초대한 멤버가 없습니다.</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg bg-gray-200 px-10 py-2 text-sm transition hover:bg-gray-300"
            onClick={onClose}
          >
            취소
          </button>
          <button className="rounded-lg bg-blue-600 px-10 py-2 text-sm text-white transition hover:bg-blue-700">
            생성
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeamCreateModal
