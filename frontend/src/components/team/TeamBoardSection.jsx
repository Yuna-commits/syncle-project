import React from 'react'
import BoardCard from '../common/BoardCard'
import CreateBoardButton from '../common/CreateBoardButton'

function TeamBoardSection({ team, onBoardCreated }) {
  const isGuestTeam = team.boards.length > 0 && team.boards[0].isGuest
  return (
    <div className="mb-10">
      {/* 팀 헤더 */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-white ${
            team.teamName === '널포인터' ? 'bg-orange-500' : 'bg-green-500'
            /* 색상 로직은 나중에 데이터 기반으로 고도화 가능 */
          }`}
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
        {!isGuestTeam && (
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
