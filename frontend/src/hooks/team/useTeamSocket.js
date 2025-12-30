// 파일: frontend/src/hooks/team/useTeamSocket.js
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketClient } from '../../utils/socketClient'

export const useTeamSocket = (teamId) => {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef(null)

  useEffect(() => {
    if (!teamId) return

    const topic = `/topic/team/${teamId}`
    let retryTimer = null

    const subscribe = () => {
      if (subscriptionRef.current) return

      if (!socketClient.isConnected()) {
        retryTimer = setTimeout(subscribe, 500) // 0.5초 뒤 재시도
        return
      }
      console.log(`🔌 [TeamSocket] 구독 시작: ${topic}`)

      subscriptionRef.current = socketClient.subscribe(topic, (message) => {
        const response = JSON.parse(message.body)

        if (
          response.type === 'TEAM_UPDATED' ||
          response.type === 'TEAM_DELETED' ||
          response.type === 'TEAM_MEMBER_ACCEPT' ||
          response.type === 'TEAM_MEMBER_UPDATE' ||
          response.type === 'TEAM_MEMBER_LEAVE'
        ) {
          console.log('🔄 [TeamSocket] 변경 감지 -> 데이터 재요청(Refetch)')

          // Promise.all로 멤버 목록과 초대 목록을 동시에 갱신합니다.
          Promise.all([
            // 팀 멤버 목록 갱신
            queryClient.invalidateQueries({
              queryKey: ['team', Number(teamId)],
            }),

            // 초대 목록 갱신
            queryClient.invalidateQueries({
              queryKey: ['invitations', 'team', Number(teamId)],
            }),
            // 사이드바의 '내 팀 목록' 갱신
            queryClient.invalidateQueries({
              queryKey: ['teams'],
            }),

            // 대시보드 메인 화면 갱신
            queryClient.invalidateQueries({
              queryKey: ['dashboard'],
            }),
          ])
        }
      })
    }

    subscribe()

    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [teamId, queryClient])
}
