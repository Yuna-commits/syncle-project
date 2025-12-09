import React, { useMemo, useState } from 'react'

import { Check, Search, UserCheck, UserPlus, X } from 'lucide-react'
import api from '../../../api/AxiosInterceptor'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 팀 멤버 중에서만 보드 멤버 초대 가능
 * - 클라이언트 측 필터링 사용
 */
function InviteBoardMemeberModal({
  boardId,
  teamMembers = [],
  currentBoardMembers = [],
  onClose,
}) {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [inviting, setInviting] = useState(false)

  // 1. 현재 참여중인 보드 멤버 ID 집합 (userId 기준)
  const currentBoardMemberIds = useMemo(() => {
    return new Set((currentBoardMembers || []).map((m) => m.id))
  }, [currentBoardMembers])

  // 2. 검색 대상 후보군 (전체 팀 멤버)
  const candidates = useMemo(() => {
    return teamMembers || []
  }, [teamMembers])

  // 3. 키워드 검색 필터링 (닉네임/이메일)
  const searchResults = useMemo(() => {
    if (!keyword.trim()) return candidates

    const lowerKeyword = keyword.toLowerCase()

    return candidates.filter((u) => {
      const name = u.name
      const email = u.email

      return (
        name.toLowerCase().includes(lowerKeyword) ||
        email.toLowerCase().includes(lowerKeyword)
      )
    })
  }, [keyword, candidates])

  // 사용자 선택 토글 함수
  const toggleUser = (user) => {
    const targetId = user.id

    // 식별자가 없으면 로직을 중단하여 전체 선택 버그 방지
    if (!targetId) return

    // 이미 보드 멤버라면 선택 불가
    if (currentBoardMemberIds.has(targetId)) return

    if (selectedUsers.find((u) => u.id === targetId)) {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== targetId))
    } else {
      setSelectedUsers((prev) => [...prev, user])
    }
  }

  // 보드 멤버 초대 요청
  const handleInvite = async () => {
    if (selectedUsers.length === 0) return

    setInviting(true)
    try {
      // 선택된 유저들의 userId 추출
      const userIds = selectedUsers.map((u) => u.id)

      // [API] 보드 멤버 추가
      await api.post(`/boards/${boardId}/members`, {
        userIds: userIds,
      })

      // 성공 시 보드 데이터 갱신
      await queryClient.invalidateQueries({
        queryKey: ['board', Number(boardId)],
      })

      onClose()
    } catch (error) {
      console.error('보드 멤버 추가 실패:', error)
      alert(error.response?.data?.message || '멤버 추가에 실패했습니다.')
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
            보드 멤버 추가
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
            팀원 중에서 보드에 초대할 멤버를 선택하세요.
          </p>

          {/* 검색 영역 */}
          <div className="relative mb-4">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름 또는 이메일로 검색"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              autoFocus
            />
            <Search className="absolute top-2.5 right-3 h-5 w-5 text-gray-400" />
          </div>

          {/* 후보 목록 (스크롤 영역) */}
          <div className="mb-4 h-60 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((user) => {
                  const userId = user.id
                  const isBoardMember = currentBoardMemberIds.has(userId)
                  const isSelected = selectedUsers.some((u) => u.id === userId)

                  const displayName = user.name
                  const displayInitial = displayName[0]

                  return (
                    <button
                      key={userId}
                      onClick={() => toggleUser(user)}
                      disabled={isBoardMember} // 이미 멤버면 클릭 불가
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                        isBoardMember
                          ? 'cursor-default bg-gray-100 opacity-60' // 이미 멤버
                          : isSelected
                            ? 'bg-blue-100 ring-1 ring-blue-200' // 선택됨
                            : 'hover:bg-white' // 기본
                      }`}
                    >
                      {/* 체크박스 UI */}
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          isBoardMember
                            ? 'border-gray-200 bg-gray-200 text-gray-500' // 이미 멤버
                            : isSelected
                              ? 'border-blue-500 bg-blue-500 text-white' // 선택됨
                              : 'border-gray-300 bg-white' // 기본
                        }`}
                      >
                        {isBoardMember ? (
                          <UserCheck size={14} /> // 이미 멤버 아이콘
                        ) : isSelected ? (
                          <Check size={14} /> // 선택됨 아이콘
                        ) : null}
                      </div>

                      {/* 프로필 이미지 */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-bold text-gray-500">
                        {user.profileImg ? (
                          <img
                            src={user.profileImg}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          displayInitial
                        )}
                      </div>

                      {/* 사용자 정보 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`truncate text-sm font-medium ${
                              isBoardMember
                                ? 'text-gray-500'
                                : isSelected
                                  ? 'text-blue-900'
                                  : 'text-gray-700'
                            }`}
                          >
                            {displayName}
                          </p>
                          {isBoardMember && (
                            <span className="shrink-0 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                              참여중
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-gray-400">
                          {user.email || ''}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <p className="text-sm">초대 가능한 팀원이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">
              {selectedUsers.length}명 선택됨
            </span>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:cursor-pointer hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleInvite}
                disabled={selectedUsers.length === 0 || inviting}
                className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer ${
                  selectedUsers.length === 0 || inviting
                    ? 'cursor-not-allowed bg-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {inviting ? '추가 중...' : '보드에 추가'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteBoardMemeberModal
