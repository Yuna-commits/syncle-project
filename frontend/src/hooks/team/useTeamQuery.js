import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { teamApi } from '../../api/team.api'
import { invitationApi } from '../../api/invitation.api'

// 나의 팀 목록 조회
export const useTeamQuery = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await teamApi.getTeams()
      return res.data.data
    },
    staleTime: 1000 * 60 * 5, // 5분
  })
}

// 팀 상세 조회
export const useTeamDetailQuery = (teamId) => {
  return useQuery({
    queryKey: ['team', Number(teamId)],
    queryFn: async () => {
      const res = await teamApi.getTeamDetail(teamId)
      return res.data.data
    },
    enabled: !!teamId, // teamId가 있을 때만 실행
    staleTime: 1000 * 60 * 1, // 1분
  })
}

// 대시보드 데이터 조회
export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await teamApi.getDashboardData()
      return res.data.data
    },
    staleTime: 1000 * 60 * 2, // 2분
  })
}

// 팀 초대 목록 조회
export const useTeamInvitationsQuery = (teamId) => {
  return useQuery({
    queryKey: ['invitations', 'team', Number(teamId)],
    queryFn: async () => {
      const res = await invitationApi.getTeamInvitations(teamId)

      return res.data.data
    },
    enabled: !!teamId,
  })
}

// 공지사항 목록 조회 Hook
export const useTeamNoticesQuery = (teamId) => {
  return useQuery({
    queryKey: ['teamNotices', teamId],
    queryFn: () => teamApi.getTeamNotices(teamId).then((res) => res.data.data),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    enabled: !!teamId, // teamId가 있을 때만 실행
  })
}

// 6. 팀 멤버 정보 조회
export const useMyTeamInfoQuery = (teamId, myUserId) => {
  const { data: memberInfo, isLoading } = useQuery({
    queryKey: ['teamMembers', teamId], // 캐시 키는 전체 멤버 목록과 공유해도 됨
    queryFn: () => teamApi.getTeamMembers(teamId).then((res) => res.data.data),
    enabled: !!teamId && !!myUserId, // teamId와 내 아이디가 있을 때만 실행
    staleTime: 1000 * 60 * 5,
    select: (members) => members.find((member) => member.userId === myUserId),
  })

  return {
    role: memberInfo?.role, // 'OWNER' or 'MEMBER'
    memberInfo, // 내 정보 전체 객체
    isLoading,
  }
}
