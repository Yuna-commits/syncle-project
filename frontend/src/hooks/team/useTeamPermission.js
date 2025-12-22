import { useMemo } from 'react'
import { useAuthQuery } from '../auth/useAuthQuery'

/**
 * 현재 로그인한 사용자의 "팀 관련 권한"을 판단하는 훅
 * @param {Object} team - 팀 상세 정보 (members 배열 포함)
 */
function useTeamPermission(team) {
  const { data: user } = useAuthQuery()

  const permissions = useMemo(() => {
    // 데이터가 없거나 로그인하지 않은 경우
    if (!team || !user) {
      return {
        myRole: null,
        canCreateBoard: false,
        canManageTeam: false,
      }
    }

    // 1. 내 정보 찾기
    const myMemberInfo = team.members?.find((m) => m.userId === user.id)
    const myRole = myMemberInfo?.role // 'OWNER' | 'MEMBER'

    // 2. 보드 생성 권한 판단
    // DB 값이 없으면 기본값 'MEMBER' (누구나 생성 가능)
    const teamCreateRole = team.boardCreateRole || 'MEMBER'

    // (설정이 MEMBER 이거나) 또는 (내 역할이 OWNER) 라면 생성 가능
    const canCreateBoard = teamCreateRole === 'MEMBER' || myRole === 'OWNER'

    // 3. 팀 관리 권한 (설정 수정, 팀 삭제 등) -> 관리자만 가능
    const canManageTeam = myRole === 'OWNER'

    return {
      myRole, // 내 역할 ('OWNER', 'MEMBER')
      canCreateBoard, // 보드 생성 가능 여부
      canManageTeam, // 팀 관리 가능 여부
    }
  }, [team, user])

  return permissions
}

export default useTeamPermission
