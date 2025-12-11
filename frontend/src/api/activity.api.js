import api from './AxiosInterceptor'

export const activityApi = {
  // 활동 통계
  getStats: () => api.get('/users/me/activities/stats'),
  // 인기 보드
  getTopBoards: () => api.get('/users/me/activities/top-boards'),
  // 활동 로그(params: 필터)
  getLogs: (params) => api.get('/users/me/activities', { params }),
}
