import api from './AxiosInterceptor'

export const boardApi = {
  // Board
  fetchBoard: (boardId) => api.get(`/boards/${boardId}/view`),
  updateBoard: (boardId, updateData) =>
    api.patch(`/boards/${boardId}`, updateData),
  deleteBoard: (boardId) => api.delete(`/boards/${boardId}`),
  toggleFavorite: (boardId) => api.post(`/boards/${boardId}/favorite`),

  // Member
  changeMemberRole: (boardId, userId, newRole) =>
    api.patch(`/boards/${boardId}/members/${userId}`, { role: newRole }),
  removeMember: (boardId, userId) =>
    api.delete(`/boards/${boardId}/members/${userId}`),

  // List
  addList: (boardId, title) =>
    api.post(`/boards/${boardId}/lists`, {
      title,
    }),
  updateList: (listId, newTitle) =>
    api.put(`/lists/${listId}`, {
      title: newTitle,
    }),
  deleteList: (listId) => api.delete(`/lists/${listId}`),
  moveList: (boardId, payload) =>
    api.patch(`/boards/${boardId}/lists/order`, payload),

  // Card
  addCard: (listId, title) =>
    api.post(`/lists/${listId}/cards`, {
      title,
    }),
  updateCard: (cardId, updates) => api.patch(`/cards/${cardId}`, updates),
  moveCard: (cardId, toListId, newIndex) =>
    api.patch(`/cards/${cardId}/move`, {
      listId: toListId,
      orderIndex: newIndex,
    }),

  // Checklist
  createChecklist: (cardId, title) =>
    api.post(`/cards/${cardId}/checklists`, { title }),
  updateChecklist: (itemId, updates) =>
    api.patch(`/checklists/${itemId}`, updates),
  deleteChecklist: (itemId) => api.delete(`/checklists/${itemId}`),

  // Comment
  createComment: (cardId, content) =>
    api.post(`/cards/${cardId}/comments`, { content }),
  updateComment: (commentId, updates) =>
    api.patch(`/comments/${commentId}`, updates),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}
