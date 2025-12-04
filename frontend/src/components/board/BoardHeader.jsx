import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { Link } from 'react-router-dom'
import InviteBoardMemeberModal from '../modals/InviteBoardMemeberModal'

function BoardHeader({ board }) {
  const { toggleSettings, toggleFavorite } = useBoardStore()

  // 모달 상태 관리
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const teamName = board.teamName
  const teamInitial = teamName.substring(0, 1).toUpperCase()

  // 아바타 스택 (최대 3명 + 나머지)
  const MAX_DISPLAY = 3
  const members = board.members || []
  const displayMembers = members.slice(0, MAX_DISPLAY)
  const remainingCount = Math.max(0, members.length - MAX_DISPLAY)

  return (
    <>
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        {/* 왼쪽: 보드 정보 */}
        <div className="flex items-center gap-4">
          {/* 팀 아이콘 클릭 시 팀 페이지로 이동 */}
          <Link
            to={`/teams/${board.teamId}/boards`}
            className="group flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
            title={`${teamName} 팀 페이지로 이동`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 shadow-sm transition-transform group-hover:scale-105">
              <span className="text-sm font-bold text-white">
                {teamInitial}
              </span>
            </div>
          </Link>

          {/* 보드 이름 & 즐겨찾기 */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">{board.title}</h1>

            <button
              onClick={toggleFavorite}
              className={`transition-colors hover:cursor-pointer focus:outline-none ${
                board.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600' // 활성화: 노란색
                  : 'text-gray-300 hover:text-yellow-500' // 비활성화: 회색 -> 호버 시 노랑
              }`}
              title={board.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                // isFavorite이면 속 채우기(fill), 아니면 선만(none)
                fill={board.isFavorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          </div>

          {/* 공개 범위 */}
          <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {board.visibility}
          </span>
        </div>

        {/* 오른쪽: 멤버 및 액션 */}
        <div className="flex items-center gap-3">
          {/* 멤버 아바타 스택 */}
          <div className="flex items-center">
            <div className="mr-2 flex -space-x-2">
              {displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-600 transition-transform hover:z-10 hover:scale-110"
                  title={`${member.name} (${member.email})`}
                >
                  {/* 프로필 이미지가 없으면 텍스트 표시 */}
                  {member.profileImg ? (
                    <img
                      src={member.profileImg}
                      alt={member.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    member.name.substring(0, 1)
                  )}
                </div>
              ))}

              {/* 남은 인원수 표시 */}
              {remainingCount > 0 && (
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-800 text-xs font-bold text-white hover:z-10"
                  title={`외 ${remainingCount}명 더 있음`}
                >
                  +{remainingCount}
                </div>
              )}
            </div>

            {/* 멤버 추가 버튼 */}
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 transition-colors hover:cursor-pointer hover:border-blue-400 hover:text-blue-600"
              title="보드 멤버 추가"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>

          <div className="mx-2 h-5 w-px bg-gray-300"></div>

          {/* 필터 버튼 */}
          <button className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            <span className="hidden sm:inline">필터</span>
          </button>

          {/* 공유 버튼 */}
          <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
            공유
          </button>

          {/* 더보기 메뉴 */}
          <button
            onClick={toggleSettings}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-md p-1.5 text-gray-500 hover:cursor-pointer hover:bg-gray-100 focus:outline-none"
            title="메뉴 열기"
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
                d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* 보드 멤버 추가 모달 */}
      {isInviteModalOpen && (
        <InviteBoardMemeberModal
          boardId={board.id}
          teamMembers={board.teamMembers} // 팀 전체 멤버
          currentBoardMembers={board.members} // 제외
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </>
  )
}

export default BoardHeader
