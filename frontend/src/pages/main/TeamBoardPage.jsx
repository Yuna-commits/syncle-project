import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' // URL 파라미터 읽기용
import api from '../../api/AxiosInterceptor' // API 설정 파일
import BoardCard from '../../components/common/BoardCard'
import CreateBoardButton from '../../components/common/CreateBoardButton'
import defaultProfile from '../../assets/images/default.png'

function TeamBoardPage() {
  // 1. URL에서 teamId 추출
  const { teamId } = useParams()

  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  // teamId가 바뀔 때마다 새로 데이터 요청
  const fetchTeamDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/teams/${teamId}`)
      setTeam(response.data.data)
    } catch (error) {
      console.error('팀 정보 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    if (teamId) fetchTeamDetail()
  }, [teamId, fetchTeamDetail])

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

            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:cursor-pointer hover:bg-gray-200">
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
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
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
    </main>
  )
}

export default TeamBoardPage
