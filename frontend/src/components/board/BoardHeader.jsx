import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { Link } from 'react-router-dom'
import InviteBoardMemeberModal from '../modals/board/InviteBoardMemeberModal'
import { useBoardMutations } from '../../hooks/board/useBoardMutations'
import { Lock, Globe, MoreHorizontal, Plus, Share2, Star } from 'lucide-react'
import BoardFilter from '../sidebar/BoardFilter'
import { useBoardDisplayMembers } from '../../utils/useBoardDisplayMembers'
import useBoardPermission from '../../hooks/board/useBoardPermission'

function BoardHeader({ board }) {
  // UI 상태 제어 함수 (Store)
  const { toggleSettings, openSettings, isSettingsOpen, settingsView } =
    useBoardStore()

  // 보드 권한 체크
  const { canInvite, canShare } = useBoardPermission(board)

  // 임시 필터 함수
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 데이터 변형 훅 (React Query)
  const { toggleFavorite, createShareToken, isCreatingToken } =
    useBoardMutations(board.id)

  // 모달 상태 관리
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const teamName = board.teamName
  const teamInitial = teamName.substring(0, 1).toUpperCase()
  const isPrivate = board.visibility === 'PRIVATE'

  // 멤버 리스트 계산 로직
  const membersToDisplay = useBoardDisplayMembers(board)

  // 아바타 스택 (최대 3명 + 나머지)
  const MAX_DISPLAY = 3
  const displayMembers = membersToDisplay.slice(0, MAX_DISPLAY)
  const remainingCount = Math.max(0, membersToDisplay.length - MAX_DISPLAY)

  // 남은 인원수 클릭 핸들러
  const handleMemberStackClick = (e) => {
    // 이벤트 전파 방지
    e.preventDefault()
    e.stopPropagation()

    // 이미 설정창이 열려있고, 현재 보고 있는 화면이 'MEMBERS'라면 -> 닫기
    if (isSettingsOpen && settingsView === 'MEMBERS') {
      toggleSettings()
    } else {
      // 그 외(닫혀있거나 다른 화면일 때) -> 'MEMBERS' 화면으로 열기
      openSettings('MEMBERS')
    }
  }

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
              onClick={() => toggleFavorite()}
              className={`transition-colors hover:cursor-pointer focus:outline-none ${
                board.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600' // 활성화: 노란색
                  : 'text-gray-300 hover:text-yellow-500' // 비활성화: 회색 -> 호버 시 노랑
              }`}
              title={board.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <Star
                size={20}
                fill={board.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* 공개 범위 */}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
            <span>{board.visibility}</span>
          </div>
        </div>

        {/* 오른쪽: 멤버 및 액션 */}
        <div className="flex items-center gap-3">
          {/* 멤버 아바타 스택 */}
          <div className="flex items-center">
            <div className={`flex -space-x-2 ${isPrivate ? 'mr-2' : ''}`}>
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

              {/* 남은 인원수 표시 -> 클릭 시 멤버 목록 설정 뷰 열기 */}
              {remainingCount > 0 && (
                <button
                  onMouseDown={handleMemberStackClick}
                  className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-800 text-xs font-bold text-white transition-transform hover:z-10 hover:scale-110"
                  title={`외 ${remainingCount}명 더 보기 (멤버 목록)`}
                >
                  +{remainingCount}
                </button>
              )}
            </div>

            {/* 멤버 추가 버튼 */}
            {isPrivate && canInvite && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 transition-colors hover:cursor-pointer hover:border-blue-400 hover:text-blue-600"
                title="보드 멤버 추가"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="mx-2 h-5 w-px bg-gray-300"></div>

          {/* 필터 버튼 */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 rounded-md px-3 py-1.5 transition-colors ${isFilterOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span className="text-sm font-medium">필터</span>
          </button>

          {/* 공유 버튼 */}
          {canShare && (
            <button
              onClick={() => createShareToken()}
              disabled={isCreatingToken}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:cursor-pointer hover:bg-blue-700 active:scale-95"
            >
              <Share2 size={16} />
              {isCreatingToken ? '생성 중...' : '공유'}
            </button>
          )}

          {/* 더보기 메뉴 */}
          <button
            onClick={toggleSettings}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100 focus:outline-none"
            title="메뉴 열기"
          >
            <MoreHorizontal size={20} />
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

      {/* 필터 팝업 컴포넌트 */}
      {isFilterOpen && (
        <BoardFilter board={board} onClose={() => setIsFilterOpen(false)} />
      )}
    </>
  )
}

export default BoardHeader
