import api from './AxiosInterceptor'

export const notificationApi = {
  // 내 알림 목록 조회
  getMyNotifications: () => api.get('/notifications'),
  // 알림 전체 읽음 처리
  markAllAsRead: () => api.patch('/notifications/read-all'),
  // 개별 알림 읽음 처리
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),

  // 내 알림 설정 조회
  getMySettings: () => api.get('/notifications/settings'),

  // 내 알림 설정 수정 (전체 업데이트)
  updateMySettings: (settings) => api.put('/notifications/settings', settings),
}
