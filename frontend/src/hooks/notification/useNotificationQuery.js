import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api/notification.api'
import { useMemo } from 'react'

export const useNotificationQuery = () => {
  // 전체 알림 목록 조회
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.getMyNotifications()
      return res.data.data || []
    },
    refetchOnWindowFocus: true,
  })

  // 읽지 않은 알림 개수
  // useMemo로 notifications 배열이 변경될 때만 재계산
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
  }
}
