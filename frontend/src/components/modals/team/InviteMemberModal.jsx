import React, { useState, useEffect, useMemo } from 'react'
import { Search, UserPlus, X, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInvitationMutations } from '../../../hooks/team/useInvitationMutations'
import { useTeamInvitationsQuery } from '../../../hooks/team/useTeamQuery'
import { useUserSearchQuery } from '../../../hooks/auth/useAuthQuery'

// 더바운싱을 위한 커스텀 훅
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

function InviteMemberModal({ teamId, currentMembers = [], onClose }) {
  const navigate = useNavigate()

  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 500) // 0.5초 디바운스
  const [selectedUsers, setSelectedUsers] = useState([])
  const [inviting, setInviting] = useState(false)

  // 초대장 발송
  const { inviteToTeam } = useInvitationMutations()

  // 이미 초대장을 보낸 사람들 조회
  const { data: invitations = [] } = useTeamInvitationsQuery(teamId)
  const pendingInvitees = useMemo(() => {
    return new Set(
      invitations
        .filter((invite) => invite.status === 'PENDING')
        .map((invite) => invite.inviteeId),
    )
  }, [invitations])

  // 사용자 검색
  const { data: searchData = [], isLoading: isSearching } =
    useUserSearchQuery(debouncedKeyword)

  // 검색 결과 필터링 (이미 멤버, 이미 초대됨, 이미 선택됨 제외)
  const searchResults = useMemo(() => {
    if (!debouncedKeyword.trim()) return []

    const currentMemberIds = new Set(currentMembers.map((m) => m.userId))
    const selectedIds = new Set(selectedUsers.map((u) => u.id))

    return searchData.filter(
      (u) =>
        !currentMemberIds.has(u.id) &&
        !selectedIds.has(u.id) &&
        !pendingInvitees.has(u.id),
    )
  }, [
    searchData,
    currentMembers,
    selectedUsers,
    pendingInvitees,
    debouncedKeyword,
  ])

  // 사용자 선택
  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => [...prev, user])
    setKeyword('') // 검색창 초기화
  }

  // 선택 취소
  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  // 초대 전송
  const handleInvite = async () => {
    if (selectedUsers.length === 0) return

    setInviting(true)
    // 선택된 사용자 id 추출
    const userIds = selectedUsers.map((u) => u.id)
    inviteToTeam(
      {
        teamId,
        userIds,
        role: 'MEMBER', // 기본 역할 지정
      },
      {
        onSuccess: () => {
          onClose()
          navigate(`/teams/${teamId}/invitations`)
        },
        onSettled: () => {
          setInviting(false)
        },
      },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="animate-in fade-in zoom-in w-[520px] transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserPlus size={24} className="text-blue-600" />
            멤버 초대
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600">
            팀에 함께할 멤버를 검색하여 초대하세요.
          </p>

          {/* 검색 영역 */}
          <div className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="이메일 또는 닉네임으로 검색"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                autoFocus
              />
              <Search className="absolute top-2.5 right-3 h-5 w-5 text-gray-400" />
            </div>

            {/* 검색 결과 드롭다운 */}
            {keyword.trim() && (
              <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-gray-500">
                    검색 중...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {user.profileImg ? (
                          <img
                            src={user.profileImg}
                            alt={user.nickname}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-gray-500">
                            {user.nickname[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.nickname}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-blue-600">
                        추가
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 선택된 사용자 목록 */}
          <div className="mb-6 min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 p-3">
            {selectedUsers.length === 0 ? (
              <p className="flex h-full items-center justify-center text-xs text-gray-400">
                초대할 멤버를 선택해주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pr-2 pl-2 shadow-sm"
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {user.nickname}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleInvite}
              disabled={selectedUsers.length === 0 || inviting}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition ${
                selectedUsers.length === 0 || inviting
                  ? 'cursor-not-allowed bg-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {inviting ? (
                '전송 중...'
              ) : (
                <>
                  <Users size={16} />
                  초대하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteMemberModal
