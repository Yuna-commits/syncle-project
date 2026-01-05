import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'
import useBoardStore from '../../stores/useBoardStore'
import useUserStore from '../../stores/useUserStore' // 작성자 정보를 위해 필요

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

  // 1. 댓글 추가 (트리 구조 유지)
  const addCommentToTree = (comments, newComment) => {
    // 부모가 없으면(최상위 댓글) 배열 끝에 추가
    if (!newComment.parentId) {
      return [...comments, newComment]
    }

    return comments.map((comment) => {
      // 부모를 찾음 -> replies에 추가
      if (comment.id === newComment.parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment],
        }
      }
      // 자식이 있다면 재귀 탐색
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addCommentToTree(comment.replies, newComment),
        }
      }
      return comment
    })
  }

  // 2. 댓글 수정 (트리 탐색)
  const updateCommentInTree = (comments, targetId, updates) => {
    return comments.map((comment) => {
      if (comment.id === targetId) {
        return { ...comment, ...updates }
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, targetId, updates),
        }
      }
      return comment
    })
  }

  // 3. 댓글 삭제 (트리 탐색)
  const deleteCommentFromTree = (comments, targetId) => {
    return comments
      .filter((comment) => comment.id !== targetId) // 현재 레벨에서 삭제
      .map((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: deleteCommentFromTree(comment.replies, targetId), // 자식 레벨에서 삭제
          }
        }
        return comment
      })
  }

  // 2. 공통 에러 핸들러
  const handleError = (context, message) => {
    if (context?.previousBoard) {
      queryClient.setQueryData(queryKey, context.previousBoard)
      useBoardStore.setState({ activeBoard: context.previousBoard })
    }
    alert(message || '요청 처리에 실패했습니다.')
  }

  // 1. 생성 (Create)
  const createCommentMutation = useMutation({
    mutationFn: ({ cardId, content, parentId }) =>
      boardApi.createComment(cardId, content, parentId),

    onSuccess: (response, { cardId, listId }) => {
      // response 구조 확인 필요 (response.data.data 또는 response.data)
      const newComment = response.data?.data || response.data

      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        targetList.tasks = targetList.tasks.map((task) => {
          if (task.id === cardId) {
            const currentComments = task.comments || []
            // ★ 재귀 헬퍼 사용
            const updatedComments = addCommentToTree(
              currentComments,
              newComment,
            )

            return {
              ...task,
              comments: updatedComments,
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
              // ★ 여기도 재귀 헬퍼 결과 적용
              comments: addCommentToTree(
                selectedCard.comments || [],
                newComment,
              ),
              commentCount: (selectedCard.commentCount || 0) + 1,
            },
          })
        }

        return newBoard
      })
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => console.error('댓글 생성 실패:', error),
  })

  // 2. 수정 (Update)
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
                // ★ 재귀 헬퍼 사용 (updateCommentInTree)
                comments: updateCommentInTree(
                  task.comments || [],
                  commentId,
                  updates,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err, vars, ctx) => handleError(ctx, '댓글 수정 실패'),
  })

  // 3. 삭제 (Delete)
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
              // ★ 재귀 헬퍼 사용 (deleteCommentFromTree)
              comments: deleteCommentFromTree(task.comments || [], commentId),
              commentCount: Math.max((task.commentCount || 0) - 1, 0),
            }
          }
          return task
        })

        newColumns[listId] = targetList
        return { ...oldBoard, columns: newColumns }
      }, vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err, vars, ctx) => handleError(ctx, '댓글 삭제 실패'),
  })

  return {
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
  }
}
