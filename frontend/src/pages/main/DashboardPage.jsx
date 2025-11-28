import React, { useEffect, useState } from 'react'
import BoardCard from '../../components/common/BoardCard'
import CreateBoardButton from '../../components/common/CreateBoardButton'
import api from '../../api/AxiosInterceptor'

function DashboardPage() {
  const [teams, setTeams] = useState([]) // 팀별로 그룹화된 데이터
  // const [recentBoards, setRecentBoards] = useState([]) // 최근 본 보드 목록

  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 내 팀 목록 (+ 보드 리스트) 조회
        const response = await api.get('/boards/me')
        const data = await response.data.data
        const groupedMap = data.reduce((acc, cur) => {
          const tName = cur.teamName || 'Unknown Team'

          // 1. 해당 팀이 아직 그룹에 없으면 초기화 (보드 배열 생성)
          if (!acc[tName]) {
            acc[tName] = {
              teamName: tName,
              teamId: cur.teamId,
              boards: [],
            }
          }

          // 2. 보드 데이터가 실존하는 경우에만 배열에 추가
          if (cur.id) {
            acc[tName].boards.push({
              id: cur.id,
              title: cur.title,
              description: cur.description,
              visibility: cur.visibility,
            })
          }

          return acc
        }, {})

        setTeams(Object.values(groupedMap))
      } catch (error) {
        console.error('내 팀 목록 조회 실패:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      {/* ---------------- 최근 본 보드 ---------------- */}
      <div className="mx-auto max-w-5xl">
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">최근에 본 목록</h2>

          <div className="grid grid-cols-4 gap-4">
            <BoardCard
              imageUrl="https://picsum.photos/400/200"
              title="default board"
            />
            <BoardCard imageUrl="https://picsum.photos/400/200" title="test" />
            <BoardCard imageUrl="https://picsum.photos/400/200" title="asdfw" />
            <BoardCard
              imageUrl="https://picsum.photos/400/200"
              title="A Team"
            />
          </div>
        </section>

        {/* ---------------- 각 팀별 보드 ---------------- */}
        <section className="space-y-10">
          {teams.length > 0 ? (
            teams.map((team) => (
              <div key={team.teamId}>
                {/* 팀 헤더 */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">
                    {team.teamName.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-lg font-semibold">{team.teamName}</h2>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {team.boards.map((board) => (
                    <BoardCard
                      key={board.id}
                      imageUrl="https://picsum.photos/400/200"
                      title={board.title}
                    />
                  ))}
                  <CreateBoardButton teamId={team.teamId} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              새로운 팀을 생성해보세요!
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
