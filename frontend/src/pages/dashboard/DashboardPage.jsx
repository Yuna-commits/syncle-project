import BoardCard from '../../components/common/BoardCard'
import TeamBoardSection from '../../components/team/TeamBoardSection'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useDashboardQuery } from '../../hooks/team/useTeamQuery'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'

function DashboardPage() {
  // 데이터 조회
  const { data: rawData, isLoading, refetch } = useDashboardQuery()
  const { data: user } = useAuthQuery()
  // 데이터 가공
  const allBoards = rawData || []

  // 즐겨찾기 목록 필터링
  const favoriteBoards = allBoards
    .filter((board) => board.isFavorite)
    .sort((a, b) => new Date(a.favoritedAt) - new Date(b.favoritedAt)) // 최신순 정렬
    .map((board) => ({
      id: board.id,
      title: board.title,
      imageUrl: board.imageUrl,
      isFavorite: board.isFavorite,
      isGuest: board.isGuest,
    }))

  // 팀별 그룹화
  const groupedMap = allBoards.reduce((acc, cur) => {
    const tName = cur.teamName || '알 수 없는 팀'

    if (!acc[tName]) {
      acc[tName] = {
        teamName: tName,
        teamId: cur.teamId,
        boardCreateRole: cur.boardCreateRole,
        members: [
          {
            userId: user?.id,
            role: cur.teamRole,
          },
        ],
        boards: [],
      }
    }

    if (cur.id) {
      // 보드가 있는 경우
      acc[tName].boards.push({
        id: cur.id,
        title: cur.title,
        imageUrl: cur.imageUrl,
        isFavorite: cur.isFavorite,
        isGuest: cur.isGuest,
      })
    }
    return acc
  }, {})

  const teams = Object.values(groupedMap)

  // 보드 생성/수정 시 refetch 호출
  const handleBoardUpdate = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      {/* ---------------- 최근 본 보드 ---------------- */}
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-4 gap-4"></div>
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">즐겨찾기</h2>

          <div className="grid grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
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
                      isGuest={board.isGuest}
                      onToggleFavorite={handleBoardUpdate}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500"
                >
                  즐겨찾기한 보드가 없습니다.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
        <section className="space-y-10">
          {teams.length > 0 ? (
            teams.map((team) => (
              // 분리한 컴포넌트 사용
              <TeamBoardSection
                key={team.teamId}
                team={team}
                onBoardCreated={handleBoardUpdate}
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
