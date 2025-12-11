import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'

export const useBoardMutations = (boardId) => {
  const queryClient = useQueryClient()
  const queryKey = ['board', boardId]

  // 즐겨찾기 토글
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => boardApi.toggleFavorite(boardId),

    onSuccess: () => {
      // 1. 대시보드 데이터 갱신 (즐겨찾기 목록, 최근 보드 등)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      // 2. 현재 보고 있는 개별 보드 상세 정보 갱신 (BoardPage)
      queryClient.invalidateQueries({ queryKey: ['board', Number(boardId)] })

      // 3. 팀 보드 목록 갱신 (TeamBoardPage)
      queryClient.invalidateQueries({ queryKey: ['teams'] }) // 팀 목록
      queryClient.invalidateQueries({ queryKey: ['team'] }) // 개별 팀 상세 (보드 목록 포함)
    },

    onError: (err, variables, context) => {
      // 4. 에러 발생 시 롤백
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKey, context.previousBoard)
      }

      // 5. 에러 메시지 처리
      if (err.response?.data?.errorCode === 'FAVORITE_LIMIT_EXCEEDED') {
        alert('즐겨찾기는 최대 4개까지만 가능합니다.')
      } else {
        alert('즐겨찾기 변경에 실패했습니다.')
      }
    },

    onSettled: () => {
      // 6. 데이터 동기화
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // 보드 생성
  const createBoardMutation = useMutation({
    mutationFn: ({ teamId, data }) => boardApi.createBoard(teamId, data),
    onSuccess: (res, { teamId }) => {
      // 대시보드 및 해당 팀의 보드 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['team', Number(teamId)] })
    },
    onError: (err) => alert(err.response?.data?.message || '보드 생성 실패'),
  })

  //보드 정보 수정 (제목, 설명, 공개범위 등) - 낙관적 업데이트 적용
  const updateBoardMutation = useMutation({
    mutationFn: (updateData) => boardApi.updateBoard(boardId, updateData),

    onMutate: async (updateData) => {
      // 1. 기존 쿼리 취소
      await queryClient.cancelQueries({ queryKey })

      // 2. 이전 상태 저장 (롤백용)
      const previousBoard = queryClient.getQueryData(queryKey)

      // 3. 캐시된 데이터 즉시 수정 (UI 반영)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        // 기존 데이터에 변경된 필드만 덮어씌움
        return { ...old, ...updateData }
      })

      return { previousBoard }
    },

    onError: (err, newBoard, context) => {
      // 에러 발생 시 이전 상태로 롤백
      queryClient.setQueryData(queryKey, context.previousBoard)
      alert('보드 정보 수정에 실패했습니다.')
    },

    onSettled: () => {
      // 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // 보드 삭제
  const deleteBoardMutation = useMutation({
    mutationFn: () => boardApi.deleteBoard(boardId),
    // 성공 후 페이지 이동은 컴포넌트(UI)에서 처리하는 것이 자연스럽습니다.
    // 여기서는 onSuccess를 비워두거나 필요한 공통 로직만 넣습니다.
  })

  return {
    toggleFavorite: toggleFavoriteMutation.mutate,
    createBoard: createBoardMutation.mutate,
    updateBoard: updateBoardMutation.mutate,
    deleteBoard: deleteBoardMutation.mutate,
  }
}
