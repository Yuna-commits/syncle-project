import api from './AxiosInterceptor'

export const boardApi = {
  // 보드 상세 조회
  fetchBoard: (boardId) => api.get(`/boards/${boardId}/view`),
  // 내 보드 목록 조회
  fetchMyBoards: () => api.get('/boards/me'),
  // 보드 생성
  createBoard: (teamId, data) => api.post(`/teams/${teamId}/boards`, data),
  // 보드 수정
  updateBoard: (boardId, updateData) =>
    api.patch(`/boards/${boardId}`, updateData),
  // 보드 삭제
  deleteBoard: (boardId) => api.delete(`/boards/${boardId}`),
  // 즐겨찾기 토글
  toggleFavorite: (boardId) => api.post(`/boards/${boardId}/favorite`),
  // 공유 토큰 생성
  createShareToken: (boardId) => api.post(`/boards/${boardId}/share-link`),

  // 보드 멤버 초대 (팀 멤버 -> 보드 멤버 추가)
  inviteMember: (boardId, userIds) =>
    api.post(`/boards/${boardId}/members`, { userIds }),
  // 멤버 권한 변경
  changeMemberRole: (boardId, userId, newRole) =>
    api.patch(`/boards/${boardId}/members/${userId}`, { role: newRole }),
  // 멤버 추방/탈퇴
  removeMember: (boardId, userId) =>
    api.delete(`/boards/${boardId}/members/${userId}`),

  // 리스트 추가
  addList: (boardId, title) =>
    api.post(`/boards/${boardId}/lists`, {
      title,
    }),
  // 리스트 수정
  updateList: (listId, newTitle) =>
    api.put(`/lists/${listId}`, {
      title: newTitle,
    }),
  // 리스트 아카이브 변경
  updateListArchiveStatus: (listId, isArchived) =>
    api.patch(`/lists/${listId}/archive`, null, {
      params: { isArchived },
    }),
  // 리스트 삭제
  deleteList: (listId) => api.delete(`/lists/${listId}`),
  // 리스트 이동
  moveList: (boardId, payload) =>
    api.patch(`/boards/${boardId}/lists/order`, payload),
  // 카드 조회(캘린더)
  fetchMyCards: (params) => api.get('/cards/me', { params }),
  // 카드 추가
  addCard: (listId, title) =>
    api.post(`/lists/${listId}/cards`, {
      title,
    }),
  // 카드 수정
  updateCard: (cardId, updates) => api.patch(`/cards/${cardId}`, updates),
  // 카드 아카이브 변경
  updateCardArchiveStatus: (cardId, isArchived) =>
    api.patch(`/cards/${cardId}/archive`, null, {
      params: { isArchived },
    }),
  // 카드 삭제
  deleteCard: (cardId) => api.delete(`/cards/${cardId}`),
  // 카드 이동
  moveCard: (cardId, toListId, newIndex) =>
    api.patch(`/cards/${cardId}/move`, {
      listId: toListId,
      orderIndex: newIndex,
    }),

  // 체크리스트 생성
  createChecklist: (cardId, title) =>
    api.post(`/cards/${cardId}/checklists`, { title }),
  // 체크리스트 수정
  updateChecklist: (itemId, updates) =>
    api.patch(`/checklists/${itemId}`, updates),
  // 체크리스트 삭제
  deleteChecklist: (itemId) => api.delete(`/checklists/${itemId}`),

  // 댓글 생성
  createComment: (cardId, content, parentId) =>
    api.post(`/cards/${cardId}/comments`, { content, parentId }),
  // 댓글 수정
  updateComment: (commentId, updates) =>
    api.patch(`/comments/${commentId}`, updates),
  // 댓글 삭제
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  // 파일 업로드
  uploadFile: (cardId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/files/card/${cardId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  // 파일 삭제
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
}
