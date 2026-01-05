import { ChevronDown } from 'lucide-react'
import React from 'react'
import { getRoleLabel } from '../../../utils/roleUtils'

function BoardRoleSelect({ member, isOwner, isMe, isPrivate, onChange }) {
  // 읽기 전용 상태 (TEAM 보드이거나 내가 OWNER가 아니거나, 내 자신의 권한인 경우)
  if (!isPrivate || !isOwner || isMe) {
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
        onChange={(e) => onChange(member, e.target.value)}
        className="block w-auto cursor-pointer rounded border border-gray-200 bg-white py-1 pl-2 text-xs font-medium text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="MEMBER">팀원</option>
        <option value="VIEWER">뷰어</option>
        <option value="OWNER" className="font-bold text-red-600">
          괸라자 위임
        </option>
      </select>
      {/* 커스텀 화살표 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
        <ChevronDown size={12} />
      </div>
    </div>
  )
}

export default BoardRoleSelect
