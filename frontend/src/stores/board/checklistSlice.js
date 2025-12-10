// import { boardApi } from '../../api/board.api'

// export const createChecklistSlice = (set, get) => ({
//   // 2. 체크리스트 아이템 생성
//   // 백엔드 API: POST /api/cards/{cardId}/checklists (Body: { title })
//   createChecklist: async (cardId, listId, title) => {
//     const { activeBoard, selectedCard } = get()

//     try {
//       const response = await boardApi.createChecklist(cardId, title)
//       const newItemId = response.data.data

//       // 새 아이템 객체 (백엔드 ChecklistVo 구조에 맞춤)
//       const newItem = {
//         id: newItemId,
//         cardId,
//         title,
//         done: false,
//       }

//       // 상태 업데이트
//       const newColumns = { ...activeBoard.columns }
//       const column = { ...newColumns[listId] }

//       column.tasks = column.tasks.map((task) => {
//         if (task.id === cardId) {
//           return {
//             ...task,
//             checklists: [...(task.checklists || []), newItem],
//           }
//         }
//         return task
//       })
//       newColumns[listId] = column

//       set({
//         activeBoard: { ...activeBoard, columns: newColumns },
//         selectedCard: {
//           ...selectedCard,
//           checklists: [...(selectedCard.checklists || []), newItem],
//         },
//       })
//     } catch (error) {
//       console.error('체크리스트 아이템 생성 실패:', error)
//     }
//   },

//   // 3. 체크리스트 아이템 수정 (완료 여부, 내용)
//   // 백엔드 API: PATCH /api/checklists/{checklistId}
//   updateChecklist: async (cardId, listId, itemId, updates) => {
//     const { activeBoard, selectedCard } = get()

//     // 낙관적 업데이트
//     const newColumns = { ...activeBoard.columns }
//     const column = { ...newColumns[listId] }

//     column.tasks = column.tasks.map((task) => {
//       if (task.id === cardId) {
//         return {
//           ...task,
//           checklists: (task.checklists || []).map((item) =>
//             item.id === itemId ? { ...item, ...updates } : item,
//           ),
//         }
//       }
//       return task
//     })
//     newColumns[listId] = column

//     set({
//       activeBoard: { ...activeBoard, columns: newColumns },
//       selectedCard: {
//         ...selectedCard,
//         checklists: (selectedCard.checklists || []).map((item) =>
//           item.id === itemId ? { ...item, ...updates } : item,
//         ),
//       },
//     })

//     try {
//       await boardApi.updateChecklist(itemId, updates)
//     } catch (error) {
//       console.error('체크리스트 아이템 수정 실패:', error)
//     }
//   },

//   // 4. 체크리스트 아이템 삭제
//   // 백엔드 API: DELETE /api/checklists/{checklistId}
//   deleteChecklist: async (cardId, listId, itemId) => {
//     const { activeBoard, selectedCard } = get()

//     // 낙관적 업데이트
//     const newColumns = { ...activeBoard.columns }
//     const column = { ...newColumns[listId] }

//     column.tasks = column.tasks.map((task) => {
//       if (task.id === cardId) {
//         return {
//           ...task,
//           checklists: (task.checklists || []).filter(
//             (item) => item.id !== itemId,
//           ),
//         }
//       }
//       return task
//     })
//     newColumns[listId] = column

//     set({
//       activeBoard: { ...activeBoard, columns: newColumns },
//       selectedCard: {
//         ...selectedCard,
//         checklists: (selectedCard.checklists || []).filter(
//           (item) => item.id !== itemId,
//         ),
//       },
//     })

//     try {
//       await boardApi.deleteChecklist(itemId)
//     } catch (error) {
//       console.error('체크리스트 아이템 삭제 실패:', error)
//     }
//   },
// })
