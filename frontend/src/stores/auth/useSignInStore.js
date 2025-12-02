import { create } from 'zustand'
import api from '../../api/AxiosInterceptor'

const useSignInStore = create((set, get) => ({
  // ==========================================
  // 1. 상태 (State)
  // ==========================================
  formData: { email: '', password: '' },
  isLoading: false,
  isKeepLogin: false, // 로그인 상태 유지 체크 여부

  // ==========================================
  // 2. 동기 액션 (Actions) - 단순 값 변경
  // ==========================================

  // 입력값 변경
  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    })),

  // 체크박스 토글
  toggleKeepLogin: () => set((state) => ({ isKeepLogin: !state.isKeepLogin })),

  // 초기화 (컨포넌트 언마운트 시 사용)
  reset: () =>
    set({
      formData: { email: '', password: '' },
      isLoading: false,
      isKeepLogin: false,
    }),

  // =================================================
  // 3. 비동기 액션 (Async Actions) - API 호출
  // =================================================

  // 이메일 로그인
  login: async (navigate, targetPath = '/dashboard') => {
    set({ isLoading: true })
    const { formData, isKeepLogin } = get()

    // [Helper] 로그인 성공 시 토큰 저장 및 이동 처리
    const handleLoginSuccess = (data) => {
      const { accessToken, refreshToken } = data

      // 로그인 상태 유지 체크 여부에 따라 토큰 저장소 결정
      if (isKeepLogin) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
      } else {
        sessionStorage.setItem('accessToken', accessToken)
        sessionStorage.setItem('refreshToken', refreshToken)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }

      // 성공 시 메인 페이지(대시보드)로 이동
      navigate(targetPath, { replace: true })
    }

    try {
      // 백엔드 API 호출
      // LoginResponse { status: "SUCCESS", data: {accessToken: {...}, refreshToken: {...}}}
      const response = await api.post('/auth/login', formData)

      handleLoginSuccess(response.data.data)
      alert('로그인 성공!')
    } catch (error) {
      // 5) 에러 처리
      const response = error.response?.data

      if (response?.errorCode === 'U007') {
        // 비활성 계정 -> 즉시 복구 시도
        if (window.confirm('비활성화된 계정입니다. 복구하시겠습니까?')) {
          try {
            await api.post('/users/reactivate', formData)

            // 복구 성공 시 다시 로그인 요청 (토큰 발급)
            const retryResponse = await api.post('/auth/login', formData)
            handleLoginSuccess(retryResponse.data.data)
            alert('계정이 복구되었습니다.')
          } catch (error) {
            const response = error.response?.data

            if (response?.errorCode === 'U001') {
              // USER_NOT_FOUND
              alert('존재하지 않거나 복구할 수 없는 계정입니다.')
            } else if (response?.errorCode === 'U004') {
              alert('비밀번호가 일치하지 않습니다.')
            } else {
              alert(response?.message || '계정 복구에 실패했습니다.')
            }
          }
        }
      } else {
        alert(response?.message || '이메일 또는 비밀번호를 확인해주세요.')
      }
    } finally {
      set({ isLoading: false })
    }
  },

  // 구글 로그인
  googleLogin: async (
    credentialResponse,
    navigate,
    targetPath = '/dashboard',
  ) => {
    set({ isLoading: true })

    try {
      // 1) 구글에서 받은 ID Token (credential) 추출
      const idToken = credentialResponse.credential

      // 2) 백엔드 API 호출
      const response = await api.post('/auth/login/google', {
        token: idToken,
      })

      // 3) 로컬 스토리지에 토큰 저장
      const { accessToken, refreshToken } = response.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // 4) 메인 페이지로 이동
      alert('로그인 성공!')
      navigate(targetPath, { replace: true })
    } catch (error) {
      console.error('구글 로그인 실패: ', error)
      alert('구글 로그인 처리에 실패했습니다.')
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useSignInStore
