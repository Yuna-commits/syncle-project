// src/hooks/board/useBoardSocket.js
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketClient } from '../../utils/socketClient'
import { useAuthQuery } from '../auth/useAuthQuery'

export const useBoardSocket = (boardId) => {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef(null)
  const { data: user } = useAuthQuery()

  useEffect(() => {
    // boardId가 없으면 아예 실행 안 함
    if (!boardId) return

    const topic = `/topic/board/${boardId}`
    let retryTimer = null

    const subscribe = () => {
      // 1. 이미 구독 중이면 중복 실행 방지
      if (subscriptionRef.current) return

      // 2.연결이 아직 안 됐다면? -> 0.5초 뒤에 다시 시도 (재귀 호출)
      if (!socketClient.isConnected()) {
        console.log('⏳ [BoardSocket] 소켓 연결 대기 중... (0.5초 뒤 재시도)')
        retryTimer = setTimeout(subscribe, 500)
        return
      }

      // 3. 연결 확인됨 -> 로그 찍고 구독 시작
      console.log(`🔌 [BoardSocket] 구독 시작 요청: ${topic}`)

      subscriptionRef.current = socketClient.subscribe(topic, (message) => {
        const response = JSON.parse(message.body)

        // 1. 내가 보낸 메시지는 여전히 무시 (중복 갱신 방지)
        if (user && response.senderId === user.id) {
          return
        }

        console.log(
          `📨 [BoardSocket] 메시지 수신(${response.type}) -> 무조건 데이터 갱신`,
        )

        queryClient.invalidateQueries({
          queryKey: ['board', Number(boardId)],
        })
      })
    }

    // 구독 시도 시작
    subscribe()

    // Cleanup: 언마운트 시 구독 해제 및 타이머 정리
    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      if (subscriptionRef.current) {
        console.log(`🔌 [BoardSocket] 구독 해제: ${topic}`)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [boardId, queryClient, user])
}
