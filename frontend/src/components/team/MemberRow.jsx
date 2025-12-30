import React from 'react'
import { useMemberMutations } from '../../hooks/useMemberMutations'
import defaultProfile from '../../assets/images/default.png'
import BoardListPopover from './BoardListPopover'
import RoleSelect from './RoleSelect'

function MemberRow({ member, currentUser, isOwner, teamId, teamName }) {
  const isMe = member.userId === currentUser?.id
  const { removeMember } = useMemberMutations(teamId, 'PUBLIC')

  // 멤버 내보내기 핸들러
  const handleRemoveMember = () => {
    const confirmMessage = isMe
      ? `정말 '${teamName}' 팀에서 탈퇴하시겠습니까?`
      : `정말 '${member.nickname}' 님을 팀에서 내보내시겠습니까?`

    if (window.confirm(confirmMessage)) {
      removeMember(member.userId)
    }
  }

  return (
    <tr className="group transition-colors duration-150 ease-in-out hover:bg-gray-50">
      {/* 1. 멤버 프로필 */}
      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <div className="flex items-center">
          <div className="relative h-10 w-10 shrink-0">
            <img
              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              src={member.profileImg || defaultProfile}
              alt=""
            />
            {isMe && (
              <span className="absolute -right-1 -bottom-1 rounded-full border border-white bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                ME
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {member.nickname}
            </div>
          </div>
        </div>
      </td>

      {/* 2. 역할 (RoleSelect 컴포넌트로 분리) */}
      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <RoleSelect
          member={member}
          isOwner={isOwner} // 현재 로그인한 유저가 OWNER인지
          isMe={isMe} // 이 행이 본인인지
          teamId={teamId}
        />
      </td>

      {/* 3. 직책 */}
      <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-gray-500">
        {member.position || '-'}
      </td>

      {/* 4. 참여 보드 (Popover 컴포넌트로 분리) */}
      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <BoardListPopover
          memberId={member.userId}
          teamId={teamId}
          initialBoards={member.boards} // 기존에 로드된 보드 데이터가 있다면 전달
        />
      </td>

      {/* 5. 이메일 */}
      <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-gray-500">
        {member.email}
      </td>

      {/* 6. 관리 (탈퇴/내보내기) */}
      <td className="px-3 py-4 text-right align-middle font-medium whitespace-nowrap">
        {isMe
          ? // 본인인데 OWNER가 아닌 경우 '탈퇴'
            member.role !== 'OWNER' && (
              <button
                onClick={handleRemoveMember}
                className="rounded-lg border border-red-200 px-4 py-1 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
              >
                탈퇴
              </button>
            )
          : // 타인이고 내가 OWNER인 경우 '내보내기'
            isOwner && (
              <button
                onClick={handleRemoveMember}
                className="rounded-lg border border-red-200 px-4 py-1 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
              >
                내보내기
              </button>
            )}
      </td>
    </tr>
  )
}

export default MemberRow
