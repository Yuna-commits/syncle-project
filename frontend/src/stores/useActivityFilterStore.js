import { create } from 'zustand'

const useActivityFilterStore = create((set) => ({
  // 필터 상태
  filter: {
    type: 'all',
    keyword: '',
    startDate: null,
    endDate: null,
  },

  // 2. 액션
  setFilter: (newFilter) =>
    set((state) => ({ filter: { ...state.filter, ...newFilter } })),

  // 초기화
  reset: () =>
    set({
      filter: { type: 'all', keyword: '', startDate: null, endDate: null },
    }),
}))

export default useActivityFilterStore
