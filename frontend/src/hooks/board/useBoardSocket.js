// hooks/board/useBoardSocket.js
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthQuery } from '../auth/useAuthQuery'
import { socketClient } from '../../utils/socketClient'

export const useBoardSocket = (boardId) => {
  const queryClient = useQueryClient()
  const { data: user, isLoading, refetch } = useAuthQuery()
  const subscriptionRef = useRef(null)

  useEffect(() => {
    // 보드 ID 없으면 아무 것도 안 함
    if (!boardId) return

    // 유저 정보가 없으면 refetch 시도 후 리턴
    if (!user) {
      if (!isLoading) {
        refetch()
      }
      return
    }

    // 메시지 핸들러
    const handleMessage = (message) => {
      try {
        const body = JSON.parse(message.body)
        console.log('[Board Socket] message:', body)

        // 내가 보낸 이벤트는 스킵 (senderId 비교)
        if (body.senderId && String(body.senderId) !== String(user.id)) {
          console.log(
            `[Board Sync] 데이터 변경 감지 (Type: ${body.type}), 보드 ${boardId} 리패치`,
          )

          queryClient.invalidateQueries({
            queryKey: ['board', Number(boardId)],
          })
        }
      } catch (e) {
        console.error('[Board Socket] 메시지 파싱 에러:', e)
      }
    }

    // 실제 구독 로직
    const subscribe = () => {
      // 이미 구독 중이면 중복 구독 방지
      if (subscriptionRef.current) return

      console.log(`[WebSocket] 보드 토픽 구독: /topic/board/${boardId}`)

      subscriptionRef.current = socketClient.subscribe(
        `/topic/board/${boardId}`,
        handleMessage,
      )
    }

    // 1) 소켓이 이미 연결된 상태라면 바로 구독
    if (socketClient.isConnected()) {
      subscribe()
    } else {
      // 2) 연결 안 돼 있으면 connect 후 onConnect에서 구독
      socketClient.connect({
        onConnect: () => {
          console.log('[WebSocket] 연결 완료, 보드 구독 시작')
          subscribe()
        },
        onStompError: (frame) => {
          console.error('[Board Socket] STOMP 에러:', frame.headers['message'])
        },
      })
    }

    // 정리(cleanup): 언마운트 / boardId 변경 / user 변경 시 구독 해제
    return () => {
      if (subscriptionRef.current) {
        console.log(`[WebSocket] 보드 구독 해제: ${boardId}`)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [boardId, user, isLoading, refetch, queryClient])
}
