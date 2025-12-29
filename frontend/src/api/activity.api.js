import api from './AxiosInterceptor'

export const activityApi = {
  // 활동 통계
  getStats: () => api.get('/users/me/activities/stats'),
  // 인기 보드
  getTopBoards: () => api.get('/users/me/activities/top-boards'),
  // 활동 로그 (params: { page, size, type, keyword, startDate, endDate })
  getMyLogs: (params) => api.get('/users/me/activities', { params }),
  // 보드 활동 로그 조회
  getBoardActivities: (boardId, cursorId, size = 20) => {
    const params = { size }
    if (cursorId) params.cursorId = cursorId
    return api.get(`/boards/${boardId}/activities`, { params })
  },
}
