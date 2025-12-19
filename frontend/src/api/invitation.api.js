import api from './AxiosInterceptor'

export const invitationApi = {
  // 팀 초대 목록 조회
  getTeamInvitations: (teamId) => api.get(`/invitations/teams/${teamId}`),
  // 초대 수락
  acceptInvitation: (token) =>
    api.post('/invitations/accept', null, {
      params: { token },
    }),
  // 초대 거절
  rejectInvitation: (token) =>
    api.post('/invitations/reject', null, {
      params: { token },
    }),
  // 초대 취소
  cancelInvitation: (invitationId) =>
    api.delete(`/invitations/${invitationId}`),
  // 팀 멤버 초대 (이메일 발송)
  inviteToTeam: (teamId, data) =>
    api.post(`/invitations/teams/${teamId}`, data),
  // 공유 링크로 보드 참여
  acceptBoardInvitation: (token) =>
    api.post('/invitations/boards/join', null, { params: { token } }),
}
