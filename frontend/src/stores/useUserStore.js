import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // 중복 검사 상태 (UI 피드백용)
  checkStatus: {
    nickname: { loading: false, message: '', isValid: false },
  },

  // 상태 초기화
  resetCheckStatus: () => {
    set({
      checkStatus: {
        nickname: { loading: false, message: '', isValid: false },
      },
    })
  },

  // 닉네임 중복 확인
  checkNicknameDuplicate: async (nickname) => {
    if (!nickname) {
      set((state) => ({
        checkStatus: {
          ...state.checkStatus,
          nickname: { loading: false, message: '', isValid: false },
        },
      }))
      return false
    }

    set((state) => ({
      checkStatus: {
        ...state.checkStatus,
        nickname: { ...state.checkStatus.nickname, loading: true, message: '' },
      },
    }))

    try {
      const response = await api.get(
        `/users/check-nickname?nickname=${nickname}`,
      )
      const isDuplicate = response.data.data

      if (isDuplicate) {
        set((state) => ({
          checkStatus: {
            ...state.checkStatus,
            nickname: {
              loading: false,
              message: '이미 사용 중인 닉네임입니다.',
              isValid: false,
            },
          },
        }))
        return false
      } else {
        set((state) => ({
          checkStatus: {
            ...state.checkStatus,
            nickname: {
              loading: false,
              message: '사용 가능한 닉네임입니다.',
              isValid: true,
            },
          },
        }))
        return true
      }
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error)
      set((state) => ({
        checkStatus: {
          ...state.checkStatus,
          nickname: {
            loading: false,
            message: '중복 확인 중 오류가 발생했습니다.',
            isValid: false,
          },
        },
      }))
      return false
    }
  },

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

  // 내 비밀번호 변경
  changePassword: async (passwordData) => {
    set({ isLoading: true })

    try {
      await api.patch('/users/password', passwordData)

      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      get().logout()

      return true
    } catch (error) {
      alert(error.response?.data?.message || '비밀번호 변경 실패')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // 계정 비활성화
  deactivateUser: async () => {
    set({ isLoading: true })

    try {
      await api.patch('/users/status')

      alert('계정이 비활성화되었습니다.')
      get().logout()

      return true
    } catch (error) {
      console.log(error)
      alert('비활성화에 실패했습니다.')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // 계정 삭제
  deleteUser: async () => {
    set({ isLoading: true })

    try {
      await api.delete('/users/me')

      alert('계정이 영구 삭제되었습니다.')
      get().logout()

      return true
    } catch (error) {
      console.log(error)
      alert('계정 삭제에 실패했습니다.')
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
