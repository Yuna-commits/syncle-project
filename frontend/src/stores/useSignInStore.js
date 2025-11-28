import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useSignInStore = create((set, get) => ({
  // ==========================================
  // 1. 상태 (State)
  // ==========================================
  formData: { email: '', password: '' },
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
      isKeepLogin: false,
    }),

  // =================================================
  // 3. 비동기 액션 (Async Actions) - API 호출
  // =================================================
  login: async (navigate) => {
    const { formData, isKeepLogin } = get()

    try {
      // 1) 백엔드 API 호출
      const response = await api.post('/auth/login', formData)

      // 2) 응답에서 데이터 추출
      // LoginResponse { status: "SUCCESS", data: {accessToken: {...}, refreshToken: {...}}}
      const { accessToken, refreshToken } = response.data.data

      // 3) 로그인 상태 유지 체크 여부에 따라 토큰 저장소 결정
      if (isKeepLogin) {
        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        // 세션에 남은 토큰 제거
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
      } else {
        // 세션 스토리지에 저장
        sessionStorage.setItem('accessToken', accessToken)
        sessionStorage.setItem('refreshToken', refreshToken)

        // 로컬에 남은 토큰 제거
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }

      // 4) 메인 페이지(대시보드)로 이동
      alert('로그인 성공!')
      navigate('/dashboard')
    } catch (error) {
      // 5) 에러 처리
      const response = error.response?.data

      if (response?.errorCode === 'U007') {
        // 비활성 계정
        if (window.confirm('비활성화된 계정입니다. 복구하시겠습니까?')) {
          navigate('/auth/reactivate')
        }
      } else {
        alert(response?.message || '이메일 또는 비밀번호를 확인해주세요.')
      }
    }
  },
}))

export default useSignInStore
