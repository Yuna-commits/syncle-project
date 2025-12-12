import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import useUserStore from '../../stores/useUserStore'

export const useBoardSocket = (boardId) => {
  const client = useRef(null)
  const queryClient = useQueryClient()
  const { user, isLoading, fetchUser } = useUserStore()

  useEffect(() => {
    // 1. 필수 데이터 확인
    if (!boardId) return

    // 유저 정보가 없으면 fetchUser 시도 (새로고침 직후 등)
    if (!user) {
      if (!isLoading) {
        fetchUser()
      }
      return
    }

    // 2. WebSocket 클라이언트 설정
    client.current = new Client({
      brokerURL: 'ws://localhost:8080/ws', // 백엔드 WebSocket 주소
      reconnectDelay: 5000, // 연결 끊기면 5초 뒤 재연결 시도

      onConnect: () => {
        console.log(`✅ WebSocket Connected to Board: ${boardId}`)

        // 리스트/카드 변경사항 구독
        client.current.subscribe(`/topic/board/${boardId}`, (message) => {
          try {
            const body = JSON.parse(message.body)

            if (body.senderId !== user.id) {
              console.log(
                `[Board Sync] 데이터가 변경되었습니다. (Type: ${body.type})`,
              )

              // React Query 캐시 무효화 -> 최신 데이터 다시 받아오기
              queryClient.invalidateQueries({
                queryKey: ['board', Number(boardId)],
              })
            }
          } catch (error) {
            console.error('Failed to parse socket message:', error)
          }
        })
      },

      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message'])
      },
    })

    // 3. 연결 활성화
    client.current.activate()

    // 4. 언마운트 시 연결 해제
    return () => {
      if (client.current) {
        console.log('🔌 Disconnecting WebSocket...')
        client.current.deactivate()
      }
    }
  }, [boardId, queryClient, user, fetchUser, isLoading])
}
