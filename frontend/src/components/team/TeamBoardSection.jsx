import React from 'react'
import BoardCard from '../common/BoardCard'
import CreateBoardButton from '../common/CreateBoardButton'
import useTeamPermission from '../../hooks/team/useTeamPermission'
import { getTeamColorClass } from '../../constants/themeConstants'

function TeamBoardSection({ team, onBoardCreated }) {
  // 보드 생성 권한 정보 조회
  const { canCreateBoard } = useTeamPermission(team)
  const logoColorClass = getTeamColorClass(team.teamName)
  return (
    <div className="mb-10">
      {/* 팀 헤더 */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-white ${logoColorClass}`}
        >
          {team.teamName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-semibold">{team.teamName}</h2>
      </div>

      {/* 보드 그리드 */}
      <div className="grid grid-cols-4 gap-4">
        {team.boards.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            imageUrl="https://picsum.photos/400/200"
            title={board.title}
            isFavorite={board.isFavorite}
            isGuest={board.isGuest}
            onToggleFavorite={onBoardCreated}
          />
        ))}

        {/* 보드 생성 버튼 (팀 ID 전달) */}
        {canCreateBoard && (
          <CreateBoardButton
            teamId={team.teamId}
            onBoardCreated={onBoardCreated}
          />
        )}
      </div>
    </div>
  )
}

export default TeamBoardSection
