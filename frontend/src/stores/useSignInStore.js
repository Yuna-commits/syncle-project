import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useSignInStore = create((set, get) => ({
  // ==========================================
  // 1. 상태 (State)
  // ==========================================
  formData: { email: '', password: '' },

  // ==========================================
  // 2. 동기 액션 (Actions) - 단순 값 변경
  // ==========================================

  // 입력값 변경
  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    })),

  // 초기화 (컨포넌트 언마운트 시 사용)
  reset: () =>
    set({
      formData: { email: '', password: '', nickname: '' },
    }),

  // =================================================
  // 3. 비동기 액션 (Async Actions) - API 호출
  // =================================================
  login: async (navigate) => {
    const { formData } = get()

    try {
      // 1) 백엔드 API 호출
      const response = await api.post('/auth/login', formData)

      // 2) 응답에서 데이터 추출
      // LoginResponse { status: "SUCCESS", data: {accessToken: {...}, refreshToken: {...}}}
      const { accessToken, refreshToken } = response.data.data

      // 3) 토큰 저장 (Local Storage)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

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
