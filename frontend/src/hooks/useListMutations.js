import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardApi } from '../api/board.api'

const DONE_LIST_ID = 'virtual-done-list'

export const useListMutations = (boardId) => {
  const queryClient = useQueryClient()
  const queryKey = ['board', Number(boardId)]

  // 리스트 이동
  const moveListMutation = useMutation({
    mutationFn: ({ oldIndex, newIndex, currentOrder }) => {
      // API 요청용 페이로드 생성
      const newOrder = [...currentOrder]
      const [movedItem] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, movedItem)

      const payload = newOrder
        .filter((id) => id !== DONE_LIST_ID) // 가상 리스트 제외
        .map((id, index) => ({
          listId: id,
          orderIndex: index,
        }))

      return boardApi.moveList(boardId, payload)
    },
    onMutate: async ({ oldIndex, newIndex }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey })
      const previousBoard = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard
        const newColumnOrder = [...oldBoard.columnOrder]
        const [movedListId] = newColumnOrder.splice(oldIndex, 1)
        newColumnOrder.splice(newIndex, 0, movedListId)
        return { ...oldBoard, columnOrder: newColumnOrder }
      })
      return { previousBoard }
    },
    onError: (err, vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKey, context.previousBoard)
      }
      alert('리스트 이동 실패')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 리스트 생성
  const addListMutation = useMutation({
    mutationFn: (title) => boardApi.addList(boardId, title),
    onSuccess: (response) => {
      const newList = response.data.data

      queryClient.setQueryData(queryKey, (oldBoard) => {
        if (!oldBoard) return oldBoard

        // columns 객체 업데이트
        const updatedColumns = {
          ...oldBoard.columns,
          [newList.id]: {
            id: newList.id,
            title: newList.title,
            order: newList.orderIndex,
            tasks: [],
          },
        }

        // columnOrder 배열 업데이트
        const newColumnOrder = [...oldBoard.columnOrder]
        // 완료 리스트가 존재하는지 확인
        const doneListIndex = newColumnOrder.indexOf(DONE_LIST_ID)

        if (doneListIndex !== -1) {
          // 완료 리스트가 있는 경우 -> 완료 리스트 앞에 새 리스트 추가
          newColumnOrder.splice(doneListIndex, 0, newList.id)
        } else {
          // 완료 리스트가 없는 경우 -> 맨 뒤에 새 리스트 추가
          newColumnOrder.push(newList.id)
        }

        return {
          ...oldBoard,
          columns: updatedColumns,
          columnOrder: newColumnOrder,
        }
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 리스트 이름 수정
  const updateListMutation = useMutation({
    mutationFn: ({ listId, title }) => boardApi.updateList(listId, title),
    onMutate: async ({ listId, title }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoard = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        const newColumns = { ...old.columns }
        if (newColumns[listId]) {
          newColumns[listId] = { ...newColumns[listId], title }
        }
        return { ...old, columns: newColumns }
      })
      return { previousBoard }
    },
    onError: (err, vars, ctx) =>
      queryClient.setQueryData(queryKey, ctx.previousBoard),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  // 리스트 삭제
  const deleteListMutation = useMutation({
    mutationFn: (listId) => boardApi.deleteList(listId),
    onMutate: async (listId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoard = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        const newColumns = { ...old.columns }
        delete newColumns[listId]
        const newOrder = old.columnOrder.filter((id) => id !== listId)
        return { ...old, columns: newColumns, columnOrder: newOrder }
      })
      return { previousBoard }
    },
    onError: (err, vars, ctx) =>
      queryClient.setQueryData(queryKey, ctx.previousBoard),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    moveList: moveListMutation.mutate,
    addList: addListMutation.mutate,
    updateList: updateListMutation.mutate,
    deleteList: deleteListMutation.mutate,
  }
}
