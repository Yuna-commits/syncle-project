import { useQueryClient } from '@tanstack/react-query'
import { useAuthQuery } from './auth/useAuthQuery'
import { useEffect, useRef } from 'react'
import { socketClient } from '../utils/socketClient'
import { useToast } from './useToast'
import { useNotificationSettings } from './notification/useNotificationSettings'

export const useGlobalSocket = () => {
  const queryClient = useQueryClient()
  const { data: user, isLoading } = useAuthQuery()

  // 토스트 훅 가져오기
  const { showToast } = useToast()

  // 현재 알림 설정 가져오기
  const { settings } = useNotificationSettings()

  // settings가 바뀔 때마다 useEffect가 재실행되는 것을 막기 위해 ref에 저장
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  // 중복 구독 방지를 위한 ref
  const subscriptionRef = useRef(null)

  useEffect(() => {
    // user가 없으면 소켓 연결 x
    if (!user) return

    // 메시지 처리 핸들러
    const handleMessage = (message) => {
      try {
        const noti = JSON.parse(message.body)
        console.log('⚡실시간 알림 도착:', noti)

        // 알림 목록 데이터 갱신
        queryClient.invalidateQueries({ queryKey: ['notifications'] })

        // === 토스트 필터링 ===
        const currentSettings = settingsRef.current

        // 1. 방해 금지 모드
        if (currentSettings.dnd) return

        // 2. 알림 타입별 체크 (NotificationType과 매핑)
        const type = noti.type
        let shouldShow = true

        switch (type) {
          case 'MENTION':
            shouldShow = currentSettings.push.mentions
            break
          case 'CARD_ASSIGNED': // 담당자 지정
            shouldShow = currentSettings.push.assignments
            break
          case 'CARD_MOVED': // 카드 이동
            shouldShow = currentSettings.push.cardMoves
            break
          case 'DEADLINE_NEAR': // 마감 임박
            shouldShow = currentSettings.push.dueDates
            break
          // 그 외(초대 등)는 기본적으로 보여주거나 별도 설정 추가
          case 'TEAM_INVITE':
          case 'BOARD_INVITE':
            shouldShow = true // 초대는 중요하므로 기본 노출
            break
          default:
            shouldShow = true
        }

        // 토스트 팝업 띄우기 (백엔드에서 보낸 메시지 사용)
        if (shouldShow && noti.message) {
          showToast(noti.message, 'info')
        }
      } catch (e) {
        console.error('알림 처리 에러: ', e)
      }
    }

    // 구독 함수 (개인 큐 구독)
    const subscribeToNotifications = () => {
      // 이미 구독 중이면 중복 구독 방지
      if (subscriptionRef.current) return

      console.log('🔔 알림 구독 시작')

      // 구독 객체를 ref에 저장
      subscriptionRef.current = socketClient.subscribe(
        '/user/queue/notifications',
        handleMessage,
      )
    }

    // 현재 소켓 상태에 따라 분기
    if (socketClient.isConnected()) {
      // 이미 연결되어 있는 경우 -> 바로 구독
      subscribeToNotifications()
    } else {
      // 연결이 안 되어 있는 경우 -> 연결 수 onConnect에서 구독
      socketClient.connect({
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        onConnect: () => {
          console.log(`전역 범위 웹 소켓 연결됨`)
          console.log(`[${user.email}] 소켓 연결 성공`)
          subscribeToNotifications()
        },
        onStompError: (frame) => {
          console.error('소켓 에러: ', frame.headers['message'])
        },
      })
    }

    // Cleanup: 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscriptionRef.current) {
        console.log('[WebSocket] 전역 구독 해제')
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }

    // 페이지 이동 시 연결 유지하기 위해 disconnect 생략
  }, [user, isLoading, queryClient, showToast])
}
