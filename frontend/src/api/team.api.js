import api from './AxiosInterceptor'

export const teamApi = {
  // 나의 팀 목록 조회
  getTeams: () => api.get('/teams'),
  // 팀 상세 조회
  getTeamDetail: (teamId) => api.get(`/teams/${teamId}`),
  // 팀 생성
  createTeam: (data) => api.post('/teams', data),
  // 팀 수정
  updateTeam: (teamId, data) => api.patch(`/teams/${teamId}`, data),
  // 팀 삭제
  deleteTeam: (teamId) => api.delete(`/teams/${teamId}`),
  // 대시보드 데이터 (내 보드 + 팀 목록)
  getDashboardData: () => api.get('/boards/me'),
  // 팀 탈퇴
  removeTeamMember: (teamId, userId) =>
    api.delete(`/teams/${teamId}/members/${userId}`),

  // 팀 멤버 전체 조회
  getTeamMembers: (teamId) => api.get(`/teams/${teamId}/members`),

  // 팀 멤버 관리
  changeMemberRole: (teamId, userId, newRole) =>
    api.patch(`/teams/${teamId}/members/${userId}`, { role: newRole }),
  removeMember: (teamId, userId) =>
    api.delete(`/teams/${teamId}/members/${userId}`),

  // 팀 멤버별 참여 보드 조회
  getMemberParticipatedBoards: (teamId, memberId) =>
    api.get(`/teams/${teamId}/members/${memberId}/boards`),

  // 공지사항 목록 조회
  getTeamNotices: (teamId) => api.get(`/teams/${teamId}/notices`),

  // 공지사항 상세 조회 (조회수 증가 포함)
  getTeamNoticeDetail: (teamId, noticeId) =>
    api.get(`/teams/${teamId}/notices/${noticeId}`),

  // 공지사항 등록
  createTeamNotice: (teamId, data) =>
    api.post(`/teams/${teamId}/notices`, data),

  // 공지사항 수정 (PATCH)
  updateTeamNotice: (teamId, noticeId, data) =>
    api.patch(`/teams/${teamId}/notices/${noticeId}`, data),

  // 공지사항 삭제
  deleteTeamNotice: (teamId, noticeId) =>
    api.delete(`/teams/${teamId}/notices/${noticeId}`),

  // 조회수 증가
  increaseViewCount: (teamId, noticeId) =>
    api.post(`/teams/${teamId}/notices/${noticeId}/view`),
}
