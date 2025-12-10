// import { boardApi } from '../../api/board.api'

// export const createMemeberSlice = (set, get) => ({
//   // 보드 멤버 역할 변경
//   changeMemberRole: async (boardId, userId, newRole) => {
//     const { activeBoard } = get()
//     // UI 먼저 변경사항 반영 - 실패 시 롤백
//     const updateMembers = activeBoard.members.map((m) =>
//       m.id === userId ? { ...m, role: newRole } : m,
//     )
//     set({ activeBoard: { ...activeBoard, members: updateMembers } })

//     try {
//       await boardApi.changeMemberRole(boardId, userId, newRole)
//     } catch (error) {
//       console.error('권한 변경 실패:', error)
//       // 롤백 (원래대로)
//       await get().fetchBoard(boardId)
//       alert('권한 변경에 실패했습니다.')
//     }
//   },

//   // 보드 멤버 탈퇴
//   removeMember: async (boardId, userId) => {
//     const { activeBoard } = get()
//     // UI 먼저 변경사항 반영
//     const filteredMembers = activeBoard.members.filter((m) => m.id !== userId)
//     set({ activeBoard: { ...activeBoard, members: filteredMembers } })

//     try {
//       await boardApi.removeMember(boardId, userId)
//     } catch (error) {
//       console.error('멤버 추방 실패:', error)
//       await get().fetchBoard(boardId)
//       alert('멤버 추방에 실패했습니다.')
//     }
//   },
// })
