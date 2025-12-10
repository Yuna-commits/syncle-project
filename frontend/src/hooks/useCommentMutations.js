import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../api/board.api'
import useBoardStore from '../stores/useBoardStore'
import useUserStore from '../stores/useUserStore' // 작성자 정보를 위해 필요

export const useCommentMutations = (boardId) => {
  const queryClient = useQueryClient()
  const queryKey = ['board', Number(boardId)]

  // 현재 로그인한 사용자 정보 (댓글 생성 시 낙관적 업데이트에 프사/이름 표시용)
  const { user: currentUser } = useUserStore()

  // 1. 낙관적 업데이트 공통 핸들러 (체크리스트와 동일 구조)
  const handleOptimisticUpdate = async (updateFn, variables) => {
    // 진행 중인 쿼리 취소
    await queryClient.cancelQueries({ queryKey })

    // 이전 상태 저장
    const previousBoard = queryClient.getQueryData(queryKey)

    // React Query 캐시 업데이트
    queryClient.setQueryData(queryKey, (oldBoard) => {
      if (!oldBoard) return oldBoard

      const newBoard = updateFn(oldBoard, variables)

      // activeBoard 업데이트
      useBoardStore.setState({ activeBoard: newBoard })

      // 현재 보고 있는 카드(selectedCard) 업데이트
      const { selectedCard } = useBoardStore.getState()
      if (selectedCard && selectedCard.id === variables.cardId) {
        const updatedList = newBoard.columns[variables.listId]
        const updatedCard = updatedList?.tasks.find(
          (t) => t.id === variables.cardId,
        )

        if (updatedCard) {
          useBoardStore.setState({ selectedCard: updatedCard })
        }
      }

      return newBoard
    })

    return { previousBoard }
  }

  // 2. 공통 에러 핸들러
  const handleError = (context, message) => {
    if (context?.previousBoard) {
      queryClient.setQueryData(queryKey, context.previousBoard)
      useBoardStore.setState({ activeBoard: context.previousBoard })
    }
    alert(message || '요청 처리에 실패했습니다.')
  }

  // -------------------------------------------------------
  // 3. 댓글 생성 (Create)
  // -------------------------------------------------------
  const createCommentMutation = useMutation({
    mutationFn: ({ cardId, content }) =>
      boardApi.createComment(cardId, content),

    // 생성은 서버에서 ID와 생성일시를 받아야 하므로 onSuccess에서 처리
    onSuccess: (response, { cardId, listId }) => {
      // 백엔드에서 반환된 완전한 댓글 객체 (CommentResponse)
      const newComment = response.data.data

      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        targetList.tasks = targetList.tasks.map((task) => {
          if (task.id === cardId) {
            return {
              ...task,
              // 댓글 배열에 추가 (comments 필드가 없으면 빈 배열로 시작)
              comments: [...(task.comments || []), newComment],
              // (옵션) 댓글 수 증가 필드가 있다면 업데이트
              commentCount: (task.commentCount || 0) + 1,
            }
          }
          return task
        })

        newColumns[listId] = targetList
        const newBoard = { ...oldBoard, columns: newColumns }

        // Zustand 동기화
        useBoardStore.setState({ activeBoard: newBoard })

        const { selectedCard } = useBoardStore.getState()
        if (selectedCard?.id === cardId) {
          useBoardStore.setState({
            selectedCard: {
              ...selectedCard,
              comments: [...(selectedCard.comments || []), newComment],
              commentCount: (selectedCard.commentCount || 0) + 1,
            },
          })
        }

        return newBoard
      })
    },
    onError: (error) => console.error('댓글 생성 실패:', error),
  })

  // -------------------------------------------------------
  // 4. 댓글 수정 (Update)
  // -------------------------------------------------------
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, updates }) =>
      boardApi.updateComment(commentId, updates),

    onMutate: (vars) =>
      handleOptimisticUpdate(
        (oldBoard, { cardId, listId, commentId, updates }) => {
          const newColumns = { ...oldBoard.columns }
          const targetList = { ...newColumns[listId] }

          targetList.tasks = targetList.tasks.map((task) => {
            if (task.id === cardId) {
              return {
                ...task,
                comments: (task.comments || []).map((comment) =>
                  comment.id === commentId
                    ? { ...comment, ...updates } // 내용 업데이트
                    : comment,
                ),
              }
            }
            return task
          })

          newColumns[listId] = targetList
          return { ...oldBoard, columns: newColumns }
        },
        vars,
      ),
    onError: (err, vars, ctx) => handleError(ctx, '댓글 수정 실패'),
  })

  // -------------------------------------------------------
  // 5. 댓글 삭제 (Delete)
  // -------------------------------------------------------
  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }) => boardApi.deleteComment(commentId),

    onMutate: (vars) =>
      handleOptimisticUpdate((oldBoard, { cardId, listId, commentId }) => {
        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        targetList.tasks = targetList.tasks.map((task) => {
          if (task.id === cardId) {
            return {
              ...task,
              // 해당 ID 제외
              comments: (task.comments || []).filter(
                (comment) => comment.id !== commentId,
              ),
              // (옵션) 댓글 수 감소
              commentCount: Math.max((task.commentCount || 0) - 1, 0),
            }
          }
          return task
        })

        newColumns[listId] = targetList
        return { ...oldBoard, columns: newColumns }
      }, vars),
    onError: (err, vars, ctx) => handleError(ctx, '댓글 삭제 실패'),
  })

  return {
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
  }
}
