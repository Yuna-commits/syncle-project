import React, { useState } from 'react'
import { Briefcase, Lock } from 'lucide-react'
import RadioOption from './RadioOption'
import { useBoardMutations } from '../../../hooks/board/useBoardMutations'

function VisibilityView({ board, isOwner }) {
  const { updateBoard } = useBoardMutations(board.id)
  const [visibility, setVisibility] = useState(board.visibility)

  const handleSubmit = (e) => {
    e.preventDefault()
    updateBoard({ visibility })
    alert('공개 범위가 변경되었습니다.')
  }

  // 핸들러 함수: props로 전달하기 쉽게 만듦
  const handleRadioChange = (e) => {
    setVisibility(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-1 space-y-4 py-2">
      <div className="space-y-3">
        <RadioOption
          value="PRIVATE"
          label="비공개"
          desc="보드 멤버만 볼 수 있습니다."
          icon={Lock}
          checked={visibility === 'PRIVATE'} // 현재 상태와 비교하여 true/false 전달
          onChange={handleRadioChange}
          disabled={!isOwner}
        />
        <RadioOption
          value="TEAM"
          label="팀 공개"
          desc="팀에 소속된 모든 멤버가 볼 수 있습니다."
          icon={Briefcase}
          checked={visibility === 'TEAM'}
          onChange={handleRadioChange}
          disabled={!isOwner}
        />
      </div>

      {isOwner ? (
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
        >
          저장
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">
          관리자만 공개 범위를 변경할 수 있습니다.
        </p>
      )}
    </form>
  )
}

export default VisibilityView
