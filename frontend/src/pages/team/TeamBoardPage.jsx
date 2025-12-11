import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom' // URL 파라미터 읽기용
import api from '../../api/AxiosInterceptor' // API 설정 파일
import BoardCard from '../../components/common/BoardCard'
import CreateBoardButton from '../../components/common/CreateBoardButton'
import defaultProfile from '../../assets/images/default.png'
import InviteMemberModal from '../../components/modals/team/InviteMemberModal'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'

function TeamBoardPage() {
  // 1. URL에서 teamId 추출
  const { teamId } = useParams()
  const navigate = useNavigate() // 페이지 이동을 위한 navigate
  const { data: user } = useAuthQuery() // 현재 로그인한 사용자 정보
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  // teamId가 바뀔 때마다 새로 데이터 요청
  // 즐겨찾기 반영 시에는 로딩 없이 데이터만 교체
  const fetchTeamDetail = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true) // showLoading이 true일 때만 로딩 표시
        const response = await api.get(`/teams/${teamId}`)
        setTeam(response.data.data)
      } catch (error) {
        console.error('팀 정보 조회 실패:', error)
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [teamId],
  )

  useEffect(() => {
    if (teamId) fetchTeamDetail()
  }, [teamId, fetchTeamDetail])

  // 팀 나가기 핸들러
  const handleLeaveTeam = async () => {
    if (!window.confirm(`'${team.name}' 팀에서 나가시겠습니까?`)) return
    try {
      await api.delete(`/teams/${team.id}/members/${user.id}`)
      alert('팀에서 나갔습니다.')
      navigate('/dashboard') // 대시보드로 이동
    } catch (error) {
      console.error('팀 나가기 실패:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!team) return <div className="p-8">팀 정보를 찾을 수 없습니다.</div>

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-5xl">
        {/* --- 1. 팀 헤더 --- */}
        <section className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-xl font-bold text-white">
                {/* 팀 이름 첫 글자 or 아이콘 */}
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{team.name}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {team.description || '팀 설명이 없습니다.'}
                </p>
              </div>
            </div>

            <button
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:cursor-pointer hover:bg-gray-200"
              onClick={handleLeaveTeam}
            >
              팀 나가기
            </button>
          </div>
        </section>

        {/* --- 2. 팀 멤버 섹션 --- */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">
            팀 멤버 ({team.members ? team.members.length : 0})
          </h2>

          <div className="flex items-center space-x-2">
            {team.members &&
              team.members.map((member) => (
                <img
                  key={member.userId}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                  // DB에 이미지가 없으면 기본 이미지 사용
                  src={member.profileImg || defaultProfile}
                  alt={member.name}
                  title={member.name}
                />
              ))}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              onClick={() => setIsInviteModalOpen(true)}
            >
              +
            </button>
          </div>
        </section>

        {/* --- 3. 팀 보드 섹션 --- */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">{team.name}의 보드</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* 보드 리스트 렌더링 */}
            {team.boards &&
              team.boards.map((board) => (
                <BoardCard
                  key={board.id}
                  id={board.id}
                  imageUrl={board.imageUrl || 'https://picsum.photos/400/200'}
                  title={board.title}
                  isFavorite={board.isFavorite}
                  onToggleFavorite={() => fetchTeamDetail(false)}
                />
              ))}

            <CreateBoardButton
              teamId={team.id}
              teamName={team.name}
              onBoardCreated={fetchTeamDetail}
            />
          </div>
        </section>
      </div>
      {/* 멤버 초대 모달 */}
      {isInviteModalOpen && (
        <InviteMemberModal
          teamId={teamId}
          currentMembers={team.members} // 이미 있는 멤버 제외용
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </main>
  )
}

export default TeamBoardPage
