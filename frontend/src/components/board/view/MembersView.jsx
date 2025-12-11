import { ChevronDown, X } from 'lucide-react'
import { useMemberMutations } from '../../../hooks/useMemberMutations'
import useUserStore from '../../../stores/useUserStore'

function MembersView({ board, isOwner }) {
  const { changeMemberRole, removeMember } = useMemberMutations(board.id)
  const { user } = useUserStore()

  const isPrivate = board?.visibility === 'PRIVATE'

  // 공개 범위에 따라 멤버 목록 다름
  const members = isPrivate ? board.members || [] : board.teamMembers || []

  // role 변경 핸들러 (Owner만 가능)
  const handleRoleChange = async (userId, newRole) => {
    changeMemberRole({ userId, newRole })
  }

  // 추방 핸들러 (Owner -> Others)
  const handleKick = async (userId, userName) => {
    if (window.confirm(`'${userName}'님을 추방하시겠습니까?`)) {
      removeMember(userId)
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
        {members.map((member) => {
          // 리스트의 멤버가 '나'인지 확인
          const isMe = user?.id === member.id

          // 작업 권한 판단
          // 내가 Owner이고 나를 제외한 상대가 Owner가 아니어야 하며 PRIVATE 보드여야 함
          const canAction =
            isOwner && member.role !== 'OWNER' && !isMe && isPrivate

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:cursor-pointer hover:bg-gray-200"
            >
              {/* 왼쪽: 멤버 정보 */}
              <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {member.profileImg ? (
                    <img
                      src={member.profileImg}
                      alt={member.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    // 이미지가 없으면 이름 첫 글자 표시
                    <span>{member.name ? member.name[0] : '?'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {member.name}
                  </p>
                  <p
                    className="truncate text-xs text-gray-400"
                    title={member.email}
                  >
                    {member.email}
                  </p>
                </div>
              </div>

              {/* 오른쪽: 조작 */}
              <div className="flex shrink-0 items-center gap-2">
                {/* 관리 권한이 있는 경우 */}
                {canAction ? (
                  <>
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

                    {/* 추방 버튼 - TEAM 보드는 탈퇴 기능 X */}
                    {board.visibility !== 'TEAM' && (
                      <button
                        onClick={() => handleKick(member.id, member.name)}
                        className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="내보내기"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  // 관리 권한이 없거나 조작 불가능한 경우 (OWNER, 본인)
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MembersView
