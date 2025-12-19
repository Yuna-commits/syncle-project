import { useMemo } from 'react'

export const useBoardDisplayMembers = (board) => {
  return useMemo(() => {
    if (!board) return []

    const isPrivate = board.visibility === 'PRIVATE'
    const boardMembers = board.members || []

    // 1. 비공개(PRIVATE): 보드 멤버만 리턴
    if (isPrivate) {
      return boardMembers
    }

    // 2. 공개(TEAM/PUBLIC): 팀 멤버를 우선하고, 팀원이 아닌 게스트를 뒤에 붙임
    const teamMembers = board.teamMembers || []

    // 팀 멤버 ID Set 생성 (빠른 중복 체크를 위해)
    const teamMemberIds = new Set(teamMembers.map((m) => m.id))

    // 팀 멤버 리스트에 없는 보드 멤버(게스트)만 추출
    const guests = boardMembers.filter((m) => !teamMemberIds.has(m.id))

    // [팀원들, ...게스트들] 순서로 병합
    return [...teamMembers, ...guests]
  }, [board])
}
