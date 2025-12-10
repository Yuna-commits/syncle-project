import { create } from 'zustand'
import { createBoardSlice } from './board/boardSlice'
// import { createListSlice } from './board/listSlice'
import { createCardSlice } from './board/cardSlice'
// import { createMemeberSlice } from './board/memberSlice'
// import { createChecklistSlice } from './board/checklistSlice'

const useBoardStore = create((...a) => ({
  /**
   * Slice Pattern
   * 컴포넌트에서는 import useBoardStore 사용
   */
  ...createBoardSlice(...a),
  // ...createListSlice(...a),
  ...createCardSlice(...a),
  // ...createMemeberSlice(...a),
  // ...createChecklistSlice(...a),
}))

export default useBoardStore
