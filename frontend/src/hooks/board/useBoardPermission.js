import { useMemo } from 'react'
import { useAuthQuery } from '../auth/useAuthQuery'

/**
 * 로그인 사용자의 현재 보드 권한 판단
 * - 보드 설정(invitationPermission 등)과 사용자 역할(Role)을 조합하여 최종 권한 계산
 */
function useBoardPermission(board) {
  const { data: user } = useAuthQuery()

  const permissions = useMemo(() => {
    // 1. 데이터가 없거나 로그인하지 않은 경우 -> 권한 없음
    if (!board || !user) {
      return {
        role: null,
        isExplicitMember: false,

        // 기본 접근 권한
        canView: false,
        canEdit: false,
        canManage: false,

        // 상세 설정 권한
        canInvite: false,
        canShare: false,
        canEditList: false,
        canDeleteCard: false,
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
      // 3. 팀 공개 보드이면 팀 멤버십 확인 (팀원은 기본 MEMBER, 팀 뷰어는 VIEWER)
      const teamMember = board.teamMembers?.find((m) => m.id === user.id)
      if (teamMember) {
        effectiveRole = teamMember.role !== 'VIEWER' ? 'MEMBER' : 'VIEWER'
      }
    } else if (board.visibility === 'PUBLIC') {
      // 4. 전체 공개 보드 (누구나 조회 가능)
      effectiveRole = 'VIEWER'
    }

    // --- 권한 체크 헬퍼 함수 ---
    // OWNER는 무조건 true
    // MEMBER는 설정값이 'MEMBERS'일 때 true
    // VIEWER는 무조건 false
    const checkSetting = (settingValue) => {
      if (effectiveRole === 'OWNER') return true
      if (effectiveRole === 'MEMBER' && settingValue === 'MEMBERS') return true
      return false
    }

    return {
      role: effectiveRole,
      isExplicitMember, // 탈퇴 버튼 노출 여부용

      // --- 기본 권한 ---
      // 조회 권한
      canView: !!effectiveRole,
      // 작업 권한 (카드 생성, 댓글 등 일반 작업) -> VIEWER가 아니면 가능
      canEdit: effectiveRole === 'OWNER' || effectiveRole === 'MEMBER',
      // 관리 권한 (설정 변경, 멤버 강퇴 등) -> OWNER만 가능
      canManage: effectiveRole === 'OWNER',

      // --- 상세 설정 기반 권한 ---
      // [멤버 초대]: 설정에 따라 MEMBER도 가능
      canInvite: checkSetting(board.invitationPermission),
      // [공유 링크]: 설정에 따라 MEMBER도 가능
      canShare: checkSetting(board.boardSharingPermission),
      // [리스트 편집]: 리스트 생성/수정/삭제/이동
      canEditList: checkSetting(board.listEditPermission),
      // [카드 삭제]: 카드 삭제 권한 (아카이브는 canEdit이면 가능하지만 삭제는 별도)
      canDeleteCard: checkSetting(board.cardDeletePermission),
    }
  }, [board, user])

  return permissions
}

export default useBoardPermission
