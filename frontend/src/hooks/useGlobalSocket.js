import { useQueryClient } from '@tanstack/react-query'
import { useAuthQuery } from './auth/useAuthQuery'
import { useEffect } from 'react'
import { socketClient } from '../utils/socketClient'

export const useGlobalSocket = () => {
  const queryClient = useQueryClient()
  const { data: user, isLoading, refetch } = useAuthQuery()

  useEffect(() => {
    if (!user) {
      // 사용자 정보가 없으면 refetch 시도
      if (!isLoading) {
        refetch()
      }
      return
    }

    // 소켓 연결 시도
    socketClient.connect({
      onConnect: () => {
        console.log(`전역 범위 웹 소켓 연결됨`)

        // [전역 기능] 개인 알림 구독
        socketClient.subscribe('/user/queue/notifications', () => {
          try {
            console.log('실시간 알림 도착')
            // 알림 목록 쿼리 갱신
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          } catch (e) {
            console.error('알림 처리 에러: ', e)
          }
        })
      },
      onStompError: (frame) => {
        console.error('소켓 에러: ', frame.headers['message'])
      },
    })
    // 페이지 이동 시 연결 유지하기 위해 disconnect 생략
  }, [user, isLoading, refetch, queryClient])
}
