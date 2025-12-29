import { ChevronDown, LogOut, Search, X } from 'lucide-react'
import { useMemberMutations } from '../../../hooks/useMemberMutations'
import { useAuthQuery } from '../../../hooks/auth/useAuthQuery'
import { useState } from 'react'
import BoardRoleSelect from './BoardRoleSelect'
import { useBoardDisplayMembers } from '../../../utils/useBoardDisplayMembers'

function MembersView({ board, isOwner }) {
  const { changeMemberRole, removeMember } = useMemberMutations(board.id)
  const { data: user } = useAuthQuery()
  const [keyword, setKeyword] = useState('')

  const isPrivate = board?.visibility === 'PRIVATE'

  // 공개 범위에 따라 멤버 목록 다름
  const allMembers = useBoardDisplayMembers(board)

  // 검색 필터링
  const members = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(keyword.toLowerCase()) ||
      m.email.toLowerCase().includes(keyword.toLowerCase()),
  )

  // role 변경 핸들러 (Owner만 가능)
  const handleRoleChange = async (member, newRole) => {
    // 1. 관리자 위임 시 경고
    if (newRole === 'OWNER') {
      const confirmed = window.confirm(
        `[경고] 정말 '${member.name}' 님에게 위임하시겠습니까?\n` +
          `위임 후 회원님은 '일반 멤버'로 변경되며, 이 작업은 되돌릴 수 없습니다.`,
      )

      if (confirmed) {
        changeMemberRole({ userId: member.id, newRole })
      }
    } else {
      // 2. 일반 권한 변경
      changeMemberRole({ userId: member.id, newRole })
    }
  }

  // 추방 핸들러 (Owner -> Others)
  const handleKick = async (userId, userName) => {
    if (window.confirm(`'${userName}'님을 추방하시겠습니까?`)) {
      removeMember(userId)
    }
  }

  // 본인 탈퇴 핸들러
  const handleLeave = async (userId) => {
    const message =
      board.visibility === 'PUBLIC'
        ? '정말 보드에서 나가시겠습니까?\n(공개 보드인 경우 팀에서도 탈퇴 처리됩니다.)'
        : '정말 보드에서 나가시겠습니까?'

    if (window.confirm(message)) {
      removeMember(userId)
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="relative mx-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={14} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="멤버 검색..."
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-1 py-1.5 pl-9 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="scrollbar-thin scrollbar-thumb-gray-200 max-h-[300px] space-y-1 overflow-y-auto pr-1">
        {members.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          members.map((member) => {
            // 리스트의 멤버가 '나'인지 확인
            const isMe = user?.id === member.id

            // 작업 권한 판단
            // 내가 Owner이고 나를 제외한 상대가 Owner가 아니어야 하며 PRIVATE 보드여야 함
            const canKick = isOwner && !isMe && isPrivate
            const canLeave = !isOwner && isMe

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
                      {isMe && (
                        <span className="ml-1 shrink-0 rounded-sm bg-blue-500 px-1 py-0.5 text-[10px] font-semibold text-white">
                          ME
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 조작 */}
                <div className="flex shrink-0 items-center gap-2">
                  <BoardRoleSelect
                    member={member}
                    isOwner={isOwner}
                    isMe={isMe}
                    isPrivate={isPrivate}
                    onChange={handleRoleChange}
                  />

                  {/* 강퇴 버튼 */}
                  {canKick && (
                    <button
                      onClick={() => handleKick(member.id, member.name)}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:cursor-pointer hover:bg-red-50 hover:text-red-600"
                      title="내보내기"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* 본인 탈퇴 버튼 */}
                  {canLeave && (
                    <button
                      onClick={() => handleLeave(member.id)}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:cursor-pointer hover:bg-red-50 hover:text-red-600"
                      title="보드 나가기"
                    >
                      <LogOut size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MembersView
