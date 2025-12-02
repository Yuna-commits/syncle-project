import React, { useCallback, useEffect, useState } from 'react'
import BoardCard from '../../components/common/BoardCard'
import api from '../../api/AxiosInterceptor'
import TeamBoardSection from '../../components/dashboard/TeamBoardSection'
import { motion, AnimatePresence } from 'framer-motion'

function DashboardPage() {
  const [teams, setTeams] = useState([])
  const [favoriteBoards, setFavoriteBoards] = useState([])

  // 데이터 불러오기
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/boards/me')
      const rawData = response.data.data

      // 즐겨찾기 목록 필터링
      const favBoards = rawData
        .filter((board) => board.isFavorite)
        .sort((a, b) => new Date(a.favoritedAt) - new Date(b.favoritedAt)) // 최신순 정렬
        .map((board) => ({
          id: board.id,
          title: board.title,
          imageUrl: board.imageUrl,
          isFavorite: board.isFavorite,
        }))
      setFavoriteBoards(favBoards)

      // 데이터 팀별 그룹화
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
            isFavorite: cur.isFavorite,
          })
        }
        return acc
      }, {})
      console.log('그룹화된 데이터:', groupedMap)
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

          <div className="grid grid-cols-4 gap-4">
            {favoriteBoards.length > 0 ? (
              favoriteBoards.map((board) => (
                <motion.div
                  key={board.id}
                  layout // [핵심] 아이템이 빠진 자리를 다른 아이템이 자연스럽게 채움
                  initial={{ opacity: 0, scale: 0.8 }} // 나타날 때 초기값
                  animate={{ opacity: 1, scale: 1 }} // 나타날 때 최종값
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 },
                  }} // 사라질 때 효과
                  transition={{ duration: 0.2 }}
                >
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    imageUrl="https://picsum.photos/400/200"
                    title={board.title}
                    isFavorite={board.isFavorite}
                    onToggleFavorite={fetchDashboardData}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500">즐겨찾기한 보드가 없습니다.</div>
            )}
          </div>
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
