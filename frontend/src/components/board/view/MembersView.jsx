import React, { useState } from 'react'
import useBoardStore from '../../../stores/useBoardStore'
import { ChevronDown, X } from 'lucide-react'

function MembersView({ board, isOwner }) {
  const { changeMemberRole, removeMember } = useBoardStore()
  const [members, setMembers] = useState(board.members)

  const handleRoleChange = (userId, newRole) => {
    changeMemberRole(board.id, userId, newRole)
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)),
    )
  }

  const handleKick = (userId) => {
    if (window.confirm('추방하시겠습니까?')) {
      removeMember(board.id, userId)
      setMembers((prev) => prev.filter((m) => m.id !== userId))
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="relative">
        <input
          type="text"
          placeholder="멤버 검색..."
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
          >
            {/* 멤버 정보 */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                {member.name[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {member.name}
                </p>
                <p className="truncate text-xs text-gray-400">{member.email}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isOwner && member.role !== 'OWNER' ? (
                <div className="relative">
                  <select
                    className="cursor-pointer appearance-none rounded bg-gray-100 py-1 pr-5 pl-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                  {/* 커스텀 화살표 */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                    <ChevronDown size={10} />
                  </div>
                </div>
              ) : (
                // 읽기 전용 배지 (내가 Owner가 아니거나, 상대가 Owner일 때)
                <span
                  className={`rounded px-2.5 py-1 text-xs font-bold ${
                    member.role === 'OWNER'
                      ? 'border border-blue-200 bg-blue-100 text-blue-600'
                      : 'border border-gray-200 bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.role}
                </span>
              )}

              {/* Owner만 역할 변경 및 추방 가능 (단, 자기 자신은 제외) */}
              {isOwner && member.role !== 'OWNER' && (
                <button
                  onClick={() => handleKick(member.id)}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="내보내기"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MembersView
