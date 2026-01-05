import React from 'react'
import { useMemberMutations } from '../../hooks/useMemberMutations'
import { getRoleLabel } from '../../utils/roleUtils'

function RoleSelect({ member, isOwner, isMe, teamId }) {
  // 멤버 역할 변경, 추방/탈퇴
  const { changeMemberRole } = useMemberMutations(teamId, 'PUBLIC')

  // 멤버 권한 변경 핸들러
  const handleRoleChange = (e) => {
    const newRole = e.target.value

    // 1. 관리자 위임 시 경고
    if (newRole === 'OWNER') {
      const confirmed = window.confirm(
        `[경고] 정말 '${member.nickname}' 님에게 위임하시겠습니까?\n` +
          `위임 후 회원님은 '일반 멤버'로 변경되며, 이 작업은 되돌릴 수 없습니다.`,
      )

      if (confirmed) {
        changeMemberRole({ userId: member.userId, newRole })
      } else {
        // 원래대로 되돌림
        e.target.value = member.role
      }
    } else {
      // 2. 일반 권한 변경
      changeMemberRole({ userId: member.userId, newRole })
    }
  }

  // 읽기 전용 상태 (내가 OWNER가 아니거나, 내 자신의 권한인 경우)
  if (!isOwner || isMe) {
    // 역할별 뱃지 색상
    const badgeStyle =
      member.role === 'OWNER'
        ? 'border-blue-200 bg-blue-100 text-blue-700'
        : member.role === 'MEMBER'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-gray-200 bg-gray-100 text-gray-600'

    return (
      <span
        className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium ${badgeStyle}`}
      >
        {getRoleLabel(member.role)}
      </span>
    )
  }

  // 수정 가능 상태 (내가 OWNER이고, 타인의 권한을 변경할 때)
  return (
    <div className="relative inline-block">
      <select
        value={member.role}
        onChange={handleRoleChange}
        className="block w-auto cursor-pointer rounded border border-gray-200 bg-white py-1 pl-2 text-xs font-medium text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="MEMBER">팀원</option>
        <option value="VIEWER">뷰어</option>
        <option value="OWNER" className="font-bold text-red-600">
          관리자 위임
        </option>
      </select>
    </div>
  )
}

export default RoleSelect
