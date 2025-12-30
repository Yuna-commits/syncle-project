import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../api/board.api'
import { teamApi } from '../api/team.api'
import { useNavigate } from 'react-router-dom'
import { useAuthQuery } from './auth/useAuthQuery'

export const useMemberMutations = (entityId, type = 'BOARD') => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const queryKey =
    type === 'PUBLIC' ? ['team', Number(entityId)] : ['board', Number(entityId)]

  const { data: user } = useAuthQuery()

  // 보드 멤버 초대 (기존 팀원을 보드에 추가)
  const inviteMemberToBoardMutation = useMutation({
    mutationFn: (userIds) => boardApi.inviteMember(entityId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err) => alert(err.response?.data?.message || '멤버 추가 실패'),
  })

  // 멤버 권한 변경
  const changeMemberRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => {
      if (type === 'PUBLIC') {
        return teamApi.changeMemberRole(entityId, userId, newRole)
      } else {
        return boardApi.changeMemberRole(entityId, userId, newRole)
      }
    },

    onMutate: async ({ userId, newRole }) => {
      // 1. 쿼리 취소
      await queryClient.cancelQueries({ queryKey })

      // 2. 이전 상태 저장
      const previousBoard = queryClient.getQueryData(queryKey)

      // 3. 낙관적 업데이트 (UI 즉시 반영)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old || !old.members) return old

        // 해당 멤버를 찾아 role 변경
        const updatedMembers = old.members.map((member) =>
          member.id === userId ? { ...member, role: newRole } : member,
        )

        return { ...old, members: updatedMembers }
      })

      return { previousBoard }
    },

    onError: (err, vars, context) => {
      // 에러 시 롤백
      queryClient.setQueryData(queryKey, context.previousBoard)
      alert('권한 변경에 실패했습니다.')
    },

    onSettled: () => {
      // 현재 보고 있는 팀/보드 상세 페이지 데이터 갱신
      queryClient.invalidateQueries({ queryKey })

      // 사이드바의 팀 목록 데이터 갱신
      if (type === 'PUBLIC') {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
      }
    },
  })

  // 멤버 내보내기 (추방/탈퇴)
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => {
      if (type === 'PUBLIC') {
        return teamApi.removeMember(entityId, userId)
      } else {
        return boardApi.removeMember(entityId, userId)
      }
    },

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoard = queryClient.getQueryData(queryKey)

      // 낙관적 업데이트
      queryClient.setQueryData(queryKey, (old) => {
        if (!old || !old.members) return old

        // 해당 멤버를 리스트에서 제거
        const filteredMembers = old.members.filter(
          (member) => member.id !== userId,
        )

        return { ...old, members: filteredMembers }
      })

      return { previousBoard }
    },

    onSuccess: (data, targetUserId) => {
      // 삭제된 멤버 ID가 현재 로그인한 유저 ID와 같다면 (본인 탈퇴)
      if (Number(targetUserId) === Number(user?.id)) {
        alert(
          type === 'PUBLIC' ? '팀에서 탈퇴했습니다.' : '보드에서 탈퇴했습니다.',
        )
        navigate('/dashboard')
        if (type === 'PUBLIC') {
          // 사이드바의 팀 목록 데이터 갱신
          queryClient.invalidateQueries({ queryKey: ['teams'] })
        }
      } else {
        alert('멤버를 추방하였습니다.')
      }
    },

    onError: (err, vars, context) => {
      queryClient.setQueryData(queryKey, context.previousData)
      const actionName = type === 'PUBLIC' ? '팀 탈퇴/추방' : '보드 탈퇴/추방'
      alert(`${actionName}에 실패했습니다.`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    inviteMemberToBoard: (userIds, options) =>
      inviteMemberToBoardMutation.mutate(userIds, options),
    changeMemberRole: changeMemberRoleMutation.mutate,
    removeMember: removeMemberMutation.mutate,
  }
}
