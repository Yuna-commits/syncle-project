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

  // 팀 멤버 관리
  changeMemberRole: (teamId, userId, newRole) =>
    api.patch(`/teams/${teamId}/members/${userId}`, { role: newRole }),
  removeMember: (teamId, userId) =>
    api.delete(`/teams/${teamId}/members/${userId}`),

  // 팀 멤버별 참여 보드 조회
  getMemberParticipatedBoards: (teamId, memberId) =>
    api.get(`/teams/${teamId}/members/${memberId}/boards`),
}
