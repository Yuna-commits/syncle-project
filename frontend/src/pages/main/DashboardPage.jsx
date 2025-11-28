import React, { useCallback, useEffect, useState } from 'react'
import BoardCard from '../../components/common/BoardCard'
import api from '../../api/AxiosInterceptor'
import TeamBoardSection from '../../components/dashboard/TeamBoardSection'

function DashboardPage() {
  const [teams, setTeams] = useState([])

  // 데이터 불러오기
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/boards/me')
      const rawData = response.data.data

      const groupedMap = rawData.reduce((acc, cur) => {
        const tName = cur.teamName || 'Unknown Team'

        if (!acc[tName]) {
          acc[tName] = {
            teamName: tName,
            teamId: cur.teamId,
            boards: [],
          }
        }

        if (cur.id) {
          acc[tName].boards.push({
            id: cur.id,
            title: cur.title,
            imageUrl: cur.imageUrl,
          })
        }
        return acc
      }, {})

      setTeams(Object.values(groupedMap))
    } catch (error) {
      console.error('대시보드 조회 실패:', error)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      {/* ---------------- 최근 본 보드 ---------------- */}
      <div className="mx-auto max-w-5xl">
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">최근에 본 목록</h2>

          <div className="grid grid-cols-4 gap-4"></div>
        </section>
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">즐겨찾기</h2>

          <div className="grid grid-cols-4 gap-4"></div>
        </section>
        <section className="space-y-10">
          {teams.length > 0 ? (
            teams.map((team) => (
              // 분리한 컴포넌트 사용
              <TeamBoardSection
                key={team.teamId}
                team={team}
                onBoardCreated={fetchDashboardData}
              />
            ))
          ) : (
            <div className="text-gray-500">소속된 팀이 없습니다.</div>
          )}
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
