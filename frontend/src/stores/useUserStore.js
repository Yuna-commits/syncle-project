import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,

  // 내 정보 가져오기 (API 호출)
  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/users/me')

      // API 호출 성공 시 user 정보 저장
      set({ user: response.data.data })
    } catch (error) {
      console.error('내 정보 조회 실패:', error)
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  // 프로필 정보 가져오기
  fetchUserProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/users/me')
      set({ user: response.data.data })
    } catch (error) {
      console.error('프로필 정보 조회 실패: ', error)
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  // 프로필 정보 수정
  updateUserProfile: async (updateData) => {
    set({ isLoading: true })
    try {
      await api.patch('/users/me', updateData)

      // 수정 성공 시 로컬 상태도 업데이트
      set((state) => ({
        user: { ...state.user, ...updateData },
      }))

      alert('프로필이 수정되었습니다.')
      return true
    } catch (error) {
      console.error('프로필 정보 수정 실패: ', error)
      alert(error.response?.data?.message || '프로필 수정에 실패했습니다.')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // 로그아웃 (상태 초기화)
  logout: () => {
    // 모든 저장소의 토큰 삭제
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')

    set({ user: null })

    window.location.href = '/auth/signin' // 로그인 페이지로 이동
  },
}))

export default useUserStore
