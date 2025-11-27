import { create } from 'zustand'

const useUiStore = create((set) => ({
  // 현재 열려있는 메뉴의 ID (null이면 아무것도 안 열린 상태)
  openedMenu: null,

  // 특정 메뉴 열기 (이미 열려있으면 닫기 - 토글 기능)
  toggleMenu: (menuId) =>
    set((state) => ({
      openedMenu: state.openedMenu === menuId ? null : menuId,
    })),

  // 특정 메뉴 열기 (강제)
  openMenu: (menuId) => set({ openedMenu: menuId }),

  // 모든 메뉴 닫기 (바깥 클릭 시 사용)
  closeAll: () => set({ openedMenu: null }),
}))

export default useUiStore
