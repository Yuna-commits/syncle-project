import React, { useState } from 'react'
import { useParams } from 'react-router-dom' // URL 파라미터 읽기용
import BoardCard from '../../components/common/BoardCard'
import CreateBoardButton from '../../components/common/CreateBoardButton'
import InviteMemberModal from '../../components/modals/team/InviteMemberModal'
import { useTeamDetailQuery } from '../../hooks/team/useTeamQuery'
import { Plus } from 'lucide-react'
import useTeamPermission from '../../hooks/team/useTeamPermission'

function TeamBoardPage() {
  // URL에서 teamId 추출
  const { teamId } = useParams()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // 팀 정보 조회
  const { data: team, isLoading, refetch } = useTeamDetailQuery(teamId)
  console.log('서버에서 받은 팀 데이터:', team)
  // 보드 생성 권한 정보 조회
  const { canCreateBoard } = useTeamPermission(team)
  if (isLoading) return <div>Loading...</div>
  if (!team) return <div>팀 정보를 불러올 수 없습니다.</div>

  const handleBoardUpdate = () => refetch()

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-5xl">
        {/* --- 1. 팀 헤더 --- */}
        <section className="flex items-center gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-xl font-bold text-white">
                {/* 팀 이름 첫 글자 or 아이콘 */}
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {team.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {team.description || '팀 설명이 없습니다.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-5 border-gray-200" />

        {/* --- 2. 팀 멤버 섹션 --- */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            팀 멤버 ({team.members ? team.members.length : 0})
          </h2>

          <div className="flex items-center space-x-2">
            {team.members &&
              team.members.map((member) => (
                <div
                  key={member.userId}
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-bold text-gray-600 transition-transform hover:z-10 hover:scale-110"
                  title={`${member.nickname} (${member.email})`}
                >
                  {/* 프로필 이미지가 없으면 텍스트 표시 */}
                  {member.profileImg ? (
                    <img
                      src={member.profileImg}
                      alt={member.nickname}
                      title={member.nickname}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    member.nickname?.substring(0, 1)
                  )}
                </div>
              ))}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 transition-colors hover:cursor-pointer hover:border-blue-400 hover:text-blue-600"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </section>

        {/* --- 3. 팀 보드 섹션 --- */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {team.name}의 보드
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {/* 보드 리스트 렌더링 */}
            {team.boards &&
              team.boards.map((board) => (
                <BoardCard
                  key={board.id}
                  id={board.id}
                  imageUrl={board.imageUrl || 'https://picsum.photos/400/200'}
                  title={board.title}
                  isFavorite={board.isFavorite}
                  onToggleFavorite={handleBoardUpdate}
                />
              ))}
            {canCreateBoard && (
              <CreateBoardButton
                teamId={team.id}
                teamName={team.name}
                onBoardCreated={handleBoardUpdate}
              />
            )}
          </div>
        </section>
      </div>
      {/* 멤버 초대 모달 */}
      {isInviteModalOpen && (
        <InviteMemberModal
          teamId={teamId}
          currentMembers={team.members} // 이미 있는 멤버 제외용
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </main>
  )
}

export default TeamBoardPage
