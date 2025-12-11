import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { teamApi } from '../../api/team.api'

export const useTeamMutations = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 팀 생성
  const createTeamMutation = useMutation({
    mutationFn: teamApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] }) // 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // 대시보드 갱신
      alert('팀이 생성되었습니다.')
    },
    onError: (err) => alert(err.response?.data?.message || '팀 생성 실패'),
  })

  // 팀 정보 수정
  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, data }) => teamApi.updateTeam(teamId, data),
    onSuccess: (res, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', Number(teamId)] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      alert('팀 정보가 수정되었습니다.')
    },
    onError: (err) => alert(err.response?.data?.message || '팀 수정 실패'),
  })

  // 팀 삭제
  const deleteTeamMutation = useMutation({
    mutationFn: (teamId) => teamApi.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      alert('팀이 삭제되었습니다.')
      navigate('/dashboard')
    },
    onError: (err) => alert(err.response?.data?.message || '팀 삭제 실패'),
  })

  return {
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
  }
}
