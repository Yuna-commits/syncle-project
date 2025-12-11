import React, { useMemo } from 'react'
import { useAuthQuery } from '../auth/useAuthQuery'

/**
 * 로그인 사용자의 현재 보드 권한 판단
 */
function useBoardPermission(board) {
  const { data: user } = useAuthQuery()

  const permisions = useMemo(() => {
    // 1. 데이터가 없거나 로그인하지 않은 경우 -> 권한 없음
    if (!board || !user) {
      return {
        role: null,
        isMember: false,
        canView: false,
        canEdit: false,
        canManage: false,
      }
    }

    let effectiveRole = null
    let isExplicitMember = false

    // 2. 명시적인 보드 멤버인지 확인
    const boardMember = board.members.find((m) => m.id === user.id)

    if (boardMember) {
      effectiveRole = boardMember.role // OWNER, MEMBER, VIEWER
      isExplicitMember = true
    } else if (board.visibility === 'TEAM') {
      // '내'가 보드 멤버가 아닌 경우
      // 3. 팀 공개 보드이면 팀 멤버십 확인
      const teamMember = board.teamMembers?.find((m) => m.id === user.id)

      if (teamMember) {
        // 팀 VIEWER -> 보드 VIEWER, 팀 OWNER/MEMBER -> 보드 MEMBER
        effectiveRole = teamMember.role !== 'VIEWER' ? 'MEMBER' : 'VIEWER'
      }
    }

    // 최종 권한 플래그 반환
    return {
      role: effectiveRole,
      isExplicitMember, // 탈퇴 버튼 노출 여부용

      // 조회 권한
      canView: !!effectiveRole,
      // 작업 권한
      canEdit: effectiveRole !== 'VIEWER',
      // 관리 권한
      canManage: effectiveRole === 'OWNER',
    }
  }, [board, user])

  return permisions
}

export default useBoardPermission
