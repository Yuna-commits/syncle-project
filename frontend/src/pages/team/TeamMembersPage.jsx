import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import InviteMemberModal from '../../components/modals/team/InviteMemberModal'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useTeamDetailQuery } from '../../hooks/team/useTeamQuery'
import MemberTable from '../../components/team/MemberTable'

export default function TeamMembersPage() {
  const { teamId } = useParams()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // 현재 로그인한 사용자 정보 가져오기
  const { data: user } = useAuthQuery()

  // 팀 정보(멤버 포함) 조회
  const { data: team, isLoading } = useTeamDetailQuery(teamId)
  const members = team?.members || []

  // 현재 사용자가 이 팀의 OWNER인지 확인
  const isOwner = members.some(
    (member) => member.userId === user.id && member.role === 'OWNER',
  )

  if (isLoading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* 헤더 */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">팀 멤버 목록</h1>
            <p className="mt-2 text-sm text-gray-500">
              팀원을 관리하고 역할을 지정할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-blue-700 hover:shadow-md"
          >
            멤버 초대
          </button>
        </div>

        <MemberTable
          members={members}
          currentUser={user}
          isOwner={isOwner}
          teamId={teamId}
          teamName={team?.name}
        />
      </div>

      {/* 멤버 초대 모달 */}
      {isInviteModalOpen && (
        <InviteMemberModal
          teamId={teamId}
          currentMembers={members} // 이미 있는 멤버 제외용
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </main>
  )
}
