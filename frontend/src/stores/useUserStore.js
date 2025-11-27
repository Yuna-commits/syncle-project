import { create } from 'zustand'
import axios from 'axios'

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,

  // 내 정보 가져오기 (API 호출)
  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      // API 호출 성공 시 user 정보 저장
      set({ user: response.data.data })
    } catch (error) {
      console.error('내 정보 조회 실패:', error)
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  // 로그아웃 (상태 초기화)
  logout: () => {
    localStorage.removeItem('accessToken') // 토큰 삭제
    set({ user: null })
    window.location.href = '/auth/Signin' // 로그인 페이지로 이동
  },
}))

export default useUserStore
