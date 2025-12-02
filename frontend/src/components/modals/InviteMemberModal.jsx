import React, { useState, useEffect } from 'react'
import { Search, UserPlus, X, Users } from 'lucide-react'
import api from '../../api/AxiosInterceptor'
import { useNavigate } from 'react-router-dom'

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
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 500) // 0.5초 디바운스
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [pendingInvitees, setPendingInvitees] = useState([])

  // 이미 초대장을 보낸 사람들 조회
  useEffect(() => {
    const fetchPendingInvitees = async () => {
      try {
        const response = await api.get(`/invitations/teams/${teamId}`)
        const data = response.data.data || []
        console.log('초대장 데이터:', data)
        const pendingIds = data
          .filter((invite) => invite.status === 'PENDING')
          .map((invite) => invite.inviteeId)
        setPendingInvitees(pendingIds)
      } catch (error) {
        console.error('초대장 조회 실패:', error)
      }
    }

    fetchPendingInvitees()
  }, [teamId])

  // 사용자 검색 API 호출
  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setLoading(true)
      try {
        const response = await api.get(
          `/users/search?keyword=${debouncedKeyword}`,
        )
        const data = response.data.data || []

        // 필터링 기준:
        // 1. 이미 멤버인 사람 (currentMemberIds)
        // 2. 현재 모달에서 선택한 사람 (selectedIds)
        // 3. 이미 초대장을 보낸 사람 (pendingInvitees)
        const currentMemberIds = new Set(currentMembers.map((m) => m.userId))
        const selectedIds = new Set(selectedUsers.map((u) => u.id))
        const pendingIds = new Set(pendingInvitees)

        const filtered = data.filter(
          (u) =>
            !currentMemberIds.has(u.id) &&
            !selectedIds.has(u.id) &&
            !pendingIds.has(u.id),
        )
        setSearchResults(filtered)
      } catch (error) {
        console.error('사용자 검색 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    searchUsers()
  }, [debouncedKeyword, currentMembers, selectedUsers, pendingInvitees])

  // 사용자 선택
  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => [...prev, user])
    setKeyword('') // 검색창 초기화
    setSearchResults([]) // 결과창 닫기
  }

  // 선택 취소
  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  // 초대 전송
  const handleInvite = async () => {
    if (selectedUsers.length === 0) return

    setInviting(true)
    try {
      const userIds = selectedUsers.map((u) => u.id)
      // POST /api/invitations/teams/{teamId}
      // Body: { userIds: [...], role: "MEMBER" }
      await api.post(`/invitations/teams/${teamId}`, {
        teamId: Number(teamId),
        userIds,
        role: 'MEMBER',
      })

      alert('초대되었습니다.')
      onClose()
      navigate(`/teams/${teamId}/invitations`)
    } catch (error) {
      console.error('초대 실패:', error)
      alert(error.response?.data?.message || '초대에 실패했습니다.')
    } finally {
      setInviting(false)
    }
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
                {loading ? (
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
