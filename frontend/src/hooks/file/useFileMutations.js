import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../api/user.api'
import { boardApi } from '../../api/board.api'
import useBoardStore from '../../stores/useBoardStore'

export const useFileMutations = (boardId) => {
  const queryClient = useQueryClient()
  const queryKey = ['board', Number(boardId)]

  // --- [Helper] 낙관적 업데이트 핸들러 (보드 스토어 동기화) ---
  const handleOptimisticUpdate = async (updateFn, variables) => {
    // 1. 관련 쿼리 취소
    await queryClient.cancelQueries({ queryKey })

    // 2. 이전 상태 스냅샷
    const previousBoard = queryClient.getQueryData(queryKey)

    // 3. React Query 캐시 업데이트
    queryClient.setQueryData(queryKey, (oldBoard) => {
      if (!oldBoard) return oldBoard

      const newBoard = updateFn(oldBoard, variables)

      // Zustand Store 동기화 (UI 즉시 반영)
      useBoardStore.setState({ activeBoard: newBoard })

      // 현재 보고 있는 카드(SelectedCard) 업데이트
      const { selectedCard } = useBoardStore.getState()
      // cardId가 있는 경우에만 상세 모달 데이터 동기화
      if (
        selectedCard &&
        variables.cardId &&
        selectedCard.id === variables.cardId
      ) {
        const updatedList = newBoard.columns[variables.listId]
        // variables에 listId가 없다면 전체 검색이 필요할 수 있으나,
        // 보통 호출 시 listId를 함께 넘기는 것이 효율적임.
        // 만약 listId가 없다면 기존 selectedCard 데이터를 기반으로 처리하거나 생략.
        if (updatedList) {
          const updatedCard = updatedList.tasks.find(
            (t) => t.id === variables.cardId,
          )
          if (updatedCard) {
            useBoardStore.setState({ selectedCard: updatedCard })
          }
        }
      }

      return newBoard
    })

    return { previousBoard }
  }

  // --- [Helper] 에러 핸들러 ---
  const handleError = (context, message) => {
    if (context?.previousBoard) {
      queryClient.setQueryData(queryKey, context.previousBoard)
      useBoardStore.setState({ activeBoard: context.previousBoard })
    }
    alert(message || '요청 처리에 실패했습니다.')
  }

  // ----------------------------------------------------------------
  // 1. 프로필 이미지 업로드
  // ----------------------------------------------------------------
  const uploadImageMutation = useMutation({
    mutationFn: ({ file, fileType }) => userApi.uploadImage(file, fileType),
  })

  // ----------------------------------------------------------------
  // 2. 카드 첨부파일 업로드
  // 파일 업로드는 서버 응답(URL/ID)이 필요하므로 낙관적 업데이트 대신 onSuccess 사용
  // ----------------------------------------------------------------
  const uploadFileMutation = useMutation({
    mutationFn: ({ cardId, file }) => boardApi.uploadFile(cardId, file),
    onSuccess: (response, { cardId, listId }) => {
      const newFile = response.data.data // FileResponse 객체

      // (1) 파일 목록 쿼리 캐시 직접 업데이트
      queryClient.setQueryData(['files', cardId], (oldFiles) => {
        return oldFiles ? [...oldFiles, newFile] : [newFile]
      })

      // (2) 보드 데이터 및 스토어 업데이트
      if (boardId) {
        queryClient.setQueryData(queryKey, (oldBoard) => {
          if (!oldBoard) return oldBoard

          const newColumns = { ...oldBoard.columns }
          const targetList = { ...newColumns[listId] }

          // 타겟 리스트가 존재할 때만 처리
          if (targetList) {
            targetList.tasks = targetList.tasks.map((task) => {
              if (task.id === cardId) {
                return {
                  ...task,
                  files: [...(task.files || []), newFile],
                  // 만약 첨부파일 개수를 표시하는 필드가 있다면 업데이트 (예: attachmentCount)
                  attachmentCount: (task.files?.length || 0) + 1,
                }
              }
              return task
            })
            newColumns[listId] = targetList
          }

          const newBoard = { ...oldBoard, columns: newColumns }

          // Zustand 동기화
          useBoardStore.setState({ activeBoard: newBoard })

          const { selectedCard } = useBoardStore.getState()
          if (selectedCard?.id === cardId) {
            useBoardStore.setState({
              selectedCard: {
                ...selectedCard,
                files: [...(selectedCard.files || []), newFile],
                attachmentCount: (selectedCard.files?.length || 0) + 1,
              },
            })
          }

          return newBoard
        })
      }
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      console.error('파일 업로드 실패:', error)
      alert('파일 업로드 중 오류가 발생했습니다.')
    },
  })

  // ----------------------------------------------------------------
  // 3. 카드 첨부파일 삭제
  // ID를 알고 있으므로 낙관적 업데이트 적용 가능
  // ----------------------------------------------------------------
  const deleteFileMutation = useMutation({
    mutationFn: ({ fileId }) => boardApi.deleteFile(fileId),
    onMutate: async (vars) => {
      const { cardId, fileId, listId } = vars

      // (1) 파일 목록 쿼리 즉시 반영
      await queryClient.cancelQueries({ queryKey: ['files', cardId] })
      const previousFiles = queryClient.getQueryData(['files', cardId])
      queryClient.setQueryData(['files', cardId], (oldFiles) =>
        oldFiles?.filter((f) => f.id !== fileId),
      )

      // (2) 보드 데이터 낙관적 업데이트
      if (!boardId) return { previousFiles }

      const { previousBoard } = await handleOptimisticUpdate((oldBoard) => {
        const newColumns = { ...oldBoard.columns }
        const targetList = { ...newColumns[listId] }

        if (targetList) {
          targetList.tasks = targetList.tasks.map((task) => {
            if (task.id === cardId) {
              const updatedFiles = (task.files || []).filter(
                (f) => f.id !== fileId,
              )
              return {
                ...task,
                files: updatedFiles,
                attachmentCount: updatedFiles.length,
              }
            }
            return task
          })
          newColumns[listId] = targetList
        }
        return { ...oldBoard, columns: newColumns }
      }, vars)

      return { previousBoard, previousFiles }
    },
    onError: (err, vars, ctx) => {
      // 롤백
      if (ctx?.previousFiles) {
        queryClient.setQueryData(['files', vars.cardId], ctx.previousFiles)
      }
      handleError(ctx, '파일 삭제 실패')
    },
    onSettled: (data, error, vars) => {
      // 정합성을 위해 쿼리 무효화
      queryClient.invalidateQueries(['files', vars.cardId])
      if (boardId) queryClient.invalidateQueries(queryKey)
    },
  })

  return {
    uploadImage: uploadImageMutation.mutateAsync,
    uploadFile: uploadFileMutation.mutate,
    deleteFile: deleteFileMutation.mutate,
  }
}
