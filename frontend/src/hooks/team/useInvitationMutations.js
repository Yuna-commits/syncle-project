import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invitationApi } from '../../api/invitation.api'
import { useNavigate } from 'react-router-dom'

export const useInvitationMutations = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 팀 멤버 초대 (이메일 발송)
  const inviteToTeamMutation = useMutation({
    mutationFn: ({ teamId, ...data }) =>
      invitationApi.inviteToTeam(teamId, data),
    onSuccess: (res, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: ['invitations', 'team', Number(teamId)],
      })
      alert('초대 메일이 발송되었습니다.')
    },
    onError: (err) => alert(err.response?.data?.message || '초대 발송 실패'),
  })

  // 초대 취소
  const cancelInvitationMutation = useMutation({
    mutationFn: invitationApi.cancelInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      alert('초대가 취소되었습니다.')
    },
    onError: (err) => alert(err.response?.data?.message || '초대 취소 실패'),
  })

  // 초대 수락
  const acceptInvitationMutation = useMutation({
    mutationFn: invitationApi.acceptInvitation,
    onSuccess: () => {
      // 팀 목록 및 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      alert('초대가 성공적으로 수락되었습니다.')
      navigate('/dashboard')
    },
    onError: (err) => alert(err.response?.data?.message || '초대 수락 실패'),
  })

  return {
    inviteToTeam: inviteToTeamMutation.mutate,
    cancelInvitation: cancelInvitationMutation.mutate,
    acceptInvitation: acceptInvitationMutation.mutate,
  }
}
