import React, { useEffect, useState } from 'react'
import defaultProfile from '../../assets/images/default.png'
import api from '../../api/AxiosInterceptor'
import { useParams } from 'react-router-dom'
import InviteMemberModal from '../../components/modals/team/InviteMemberModal'
import useUserStore from '../../stores/useUserStore'

export default function TeamMembersPage() {
  const { teamId } = useParams()
  const [members, setMembers] = useState([])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // 현재 로그인한 사용자 정보 가져오기
  const { user } = useUserStore()

  // [변경] 현재 열려있는 메뉴의 ID를 저장 (예: 'role-1', 'board-2')
  const [activeMenu, setActiveMenu] = useState(null)

  // 로딩 상태 관리 (어떤 멤버의 보드를 로딩 중인지)
  const [loadingMemberId, setLoadingMemberId] = useState(null)

  // 현재 사용자가 이 팀의 OWNER인지 확인
  // members 배열이 로드된 후, 내 userId와 일치하는 멤버의 역할을 확인합니다.
  const isOwner = members.some(
    (member) => member.userId === user.id && member.role === 'OWNER',
  )

  // 1. 초기 멤버 목록 조회
  useEffect(() => {
    if (!teamId) return

    const fetchMembers = async () => {
      try {
        const response = await api.get(`/teams/${teamId}/members`)
        console.log('멤버 데이터:', response.data.data)
        setMembers(response.data.data)
      } catch (error) {
        console.error('멤버 조회 실패', error)
      }
    }
    fetchMembers()
  }, [teamId])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const closeMenu = () => setActiveMenu(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  // 2. 메뉴 토글 함수 (역할/보드 공통 사용)
  const toggleMenu = (e, type, id) => {
    e.stopPropagation() // 클릭 이벤트 전파 방지
    const menuId = `${type}-${id}`
    // 이미 열려있으면 닫고(null), 아니면 엶
    setActiveMenu((prev) => (prev === menuId ? null : menuId))
  }

  // 3. [핵심] 보드 보기 클릭 핸들러 (Lazy Loading)
  const handleBoardClick = async (e, memberId) => {
    // 일단 메뉴를 엽니다.
    toggleMenu(e, 'board', memberId)

    // 해당 멤버를 찾습니다.
    const targetMember = members.find((m) => m.userId === memberId)

    // 이미 보드 데이터가 배열로 존재하면 API 호출 스킵 (캐싱)
    if (targetMember && Array.isArray(targetMember.boards)) {
      return
    }

    // 데이터가 없으면 API 호출 시작
    try {
      setLoadingMemberId(memberId)

      // [API 호출] 해당 멤버의 보드 목록 가져오기
      // 경로는 백엔드 명세에 따라 수정 필요 (예: /teams/{teamId}/members/{memberId}/boards)
      const response = await api.get(
        `/teams/${teamId}/members/${memberId}/boards`,
      )
      const fetchedBoards = response.data.data || [] // 데이터가 없으면 빈 배열

      // [상태 업데이트] 기존 members 배열에서 해당 멤버만 찾아서 boards 업데이트
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === memberId ? { ...m, boards: fetchedBoards } : m,
        ),
      )
    } catch (error) {
      console.error('보드 목록 조회 실패', error)
      // 에러 나면 빈 배열로 처리해서 계속 로딩 뜨는 것 방지
      setMembers((prev) =>
        prev.map((m) => (m.userId === memberId ? { ...m, boards: [] } : m)),
      )
    } finally {
      setLoadingMemberId(null)
    }
  }

  // 4. 멤버 내보내기 핸들러
  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`)
      // 멤버 목록에서 제거
      setMembers((prev) => prev.filter((m) => m.userId !== memberId))
    } catch (error) {
      console.error('멤버 내보내기 실패', error)
    }
  }

  // 5. 멤버 역할 변경 핸들러
  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.patch(`/teams/${teamId}/members/${memberId}/role`, {
        role: newRole,
      })
      // 멤버 목록에서 역할 업데이트
      setMembers((prev) =>
        prev.map((m) => (m.userId === memberId ? { ...m, role: newRole } : m)),
      )
      // 메뉴 닫기
      setActiveMenu(null)
    } catch (error) {
      console.error('멤버 역할 변경 실패', error)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="mt-10 flex items-center justify-between px-2">
          <h3 className="text-xl font-semibold text-gray-800">팀 멤버 목록</h3>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:cursor-pointer hover:bg-blue-700"
            onClick={() => setIsInviteModalOpen(true)}
          >
            멤버 추가
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-300">
          <div className="max-w-full overflow-x-auto">
            {/* 테이블 */}
            <table className="min-w-full">
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    멤버
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    팀 역할
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    직책
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    보드
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    이메일
                  </th>
                  {/* OWNER일 때만 '관리' 컬럼 표시 */}
                  {isOwner && (
                    <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                      관리
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {members.map((member) => {
                  // 현재 렌더링 중인 행의 메뉴 ID들
                  const roleMenuId = `role-${member.userId}`
                  const boardMenuId = `board-${member.userId}`
                  const isMe = member.userId === user?.id
                  return (
                    <tr key={member.userId}>
                      {/* 유저 정보 */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10">
                            <img
                              src={member.profileImg || defaultProfile}
                              alt={member.nickname}
                              className="h-full w-full rounded-full object-cover"
                            />
                            {isMe && (
                              <span className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center text-[15px] font-bold text-yellow-400">
                                나
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800">
                              {member.nickname}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 팀 역할 */}
                      <td className="relative px-4 py-3 text-sm text-gray-800">
                        {/*  OWNER일 경우만 역할 선택 버튼 */}
                        {isOwner ? (
                          <>
                            <button
                              onClick={(e) =>
                                toggleMenu(e, 'role', member.userId)
                              }
                              className="rounded-lg border border-gray-300 px-3 py-1 hover:cursor-pointer hover:bg-gray-200"
                            >
                              {member.role || 'Member'}
                            </button>

                            {/* 역할 선택 드롭다운 (activeMenu가 일치할 때만 렌더링) */}
                            {activeMenu === roleMenuId && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-1/2 left-[70%] z-20 w-36 -translate-y-1/2 rounded-lg border border-gray-300 bg-white shadow-md"
                              >
                                <div className="flex flex-col p-1 text-sm text-gray-800">
                                  {['OWNER', 'MEMBER', 'VIEWER'].map((role) => (
                                    <div
                                      key={role}
                                      className="cursor-pointer rounded-md px-3 py-2 hover:bg-gray-200"
                                      onClick={() =>
                                        handleRoleChange(member.userId, role)
                                      }
                                    >
                                      {role}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="inline-block px-1 py-1 text-gray-600">
                            {' '}
                            {member.role || 'Member'}{' '}
                          </span>
                        )}
                      </td>

                      {/* 직책 (개인 직책) */}
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {member.position || '-'}
                      </td>

                      {/* 보드 */}
                      <td className="relative px-4 py-3 text-sm text-gray-800">
                        <button
                          // [변경] 클릭 시 handleBoardClick 호출 (API 호출 포함)
                          onClick={(e) => handleBoardClick(e, member.userId)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:cursor-pointer hover:bg-gray-200"
                        >
                          보드 보기
                        </button>

                        {/* 보드 리스트 드롭다운 (activeMenu가 일치할 때만 렌더링) */}
                        {activeMenu === boardMenuId && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-1/2 left-[80%] z-20 w-48 -translate-y-1/2 rounded-lg border border-gray-300 bg-white shadow-lg"
                          >
                            <div className="max-h-48 space-y-1 overflow-y-auto p-2">
                              {/* 1. 로딩 중일 때 */}
                              {loadingMemberId === member.userId && (
                                <div className="px-2 py-1 text-center text-sm text-gray-500">
                                  로딩 중...
                                </div>
                              )}

                              {/* 2. 로딩 완료 + 데이터 없음 */}
                              {loadingMemberId !== member.userId &&
                                member.boards &&
                                member.boards.length === 0 && (
                                  <div className="px-2 py-1 text-center text-sm text-gray-500">
                                    참여한 보드가 없습니다
                                  </div>
                                )}

                              {/* 3. 데이터 있음 */}
                              {member.boards?.map((board) => (
                                <div
                                  key={board.id}
                                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-200"
                                >
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                      backgroundColor: board.color || '#ccc',
                                    }}
                                  />
                                  <span className="truncate text-sm text-gray-800">
                                    {board.name || board.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 이메일 */}
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {member.email}
                      </td>

                      {/* 관리 (내보내기) - OWNER만 표시 */}
                      {isOwner && (
                        <td className="px-4 py-3 text-sm">
                          <button
                            disabled={isMe}
                            onClick={() => handleRemoveMember(member.userId)}
                            className={`rounded-lg border px-3 py-1 text-sm ${
                              isMe
                                ? 'border-gray-200 bg-gray-100 text-gray-400'
                                : 'border-gray-300 text-red-600 hover:cursor-pointer hover:bg-gray-200'
                            }`}
                          >
                            내보내기
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
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
