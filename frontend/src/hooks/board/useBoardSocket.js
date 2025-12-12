import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthQuery } from '../auth/useAuthQuery'
import { socketClient } from '../../utils/socketClient'

export const useBoardSocket = (boardId) => {
  const queryClient = useQueryClient()
  const { data: user, isLoading, refetch } = useAuthQuery()

  // 구독 객체를 저장해뒀다가 언마운트시 해제
  const subscriptionRef = useRef(null)

  useEffect(() => {
    // 1. 필수 데이터 확인
    if (!boardId) return

    // 유저 정보가 없으면 refetch 시도 (새로고침 직후 등)
    if (!user) {
      if (!isLoading) {
        refetch()
      }
      return
    }

    // 2. 보드 구독
    const trySubscribe = () => {
      if (socketClient.isConnected()) {
        console.log(`구독 중인 보드: ${boardId}`)

        // 기존 구독이 있다면 해제 후 재구독
        if (subscriptionRef.current) subscriptionRef.current.unsubscribe()

        subscriptionRef.current = socketClient.subscribe(
          `/topic/board/${boardId}`,
          (message) => {
            try {
              const body = JSON.parse(message.body)

              // 내가 보낸 메시지가 아닐 때만 갱신 (Optional)
              // NotificationDto 구조에 senderId가 있다면 체크
              if (body.senderId && String(body.senderId) !== String(user.id)) {
                console.log(
                  `[Board Sync] 데이터가 변경되었습니다. (Type: ${body.type})`,
                )

                // React Query 캐시 무효화 -> 최신 데이터 다시 받아오기
                queryClient.invalidateQueries({
                  queryKey: ['board', Number(boardId)],
                })
              }
            } catch (error) {
              console.error('소켓 메시지 파싱 오류: ', error)
            }
          },
        )
      }
    }

    // 초기 실행
    trySubscribe()

    // 소켓 연결 대기 (새로고침 직후 등 연결 중일 때를 대비)
    const interval = setInterval(() => {
      if (!subscriptionRef.current && socketClient.isConnected) {
        trySubscribe()
      }
    }, 500)

    // 언마운트 시 "해당 보드 구독만" 연결 해제 -> 소켓 연결은 유지
    return () => {
      clearInterval(interval)
      if (subscriptionRef.current) {
        console.log(`${boardId}: 보드 구독 해제`)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [boardId, user, isLoading, refetch, queryClient])
}
