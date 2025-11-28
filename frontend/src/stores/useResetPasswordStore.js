import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useResetPasswordStore = create((set, get) => ({
  // ==========================================
  // 1. 상태 (State)
  // ==========================================

  step: 1,
  email: '',
  authCode: '',
  newPassword: '',
  resetToken: '',
  timeLeft: 300, // 5분
  isLoading: false,
  isResending: false, // 재전송 버튼 로딩 상태

  // ==========================================
  // 2. 동기 액션 (Actions) - 단순 값 변경
  // ==========================================

  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setAuthCode: (code) => set({ authCode: code }),
  setNewPassword: (password) => set({ newPassword: password }),

  // 타이머
  setTimeLeft: (time) => set({ timeLeft: time }),
  decreaseTime: () => set((state) => ({ timeLeft: state.timeLeft - 1 })),

  // 초기화 (컨포넌트 언마운트 시 사용)
  reset: () =>
    set({
      step: 1,
      email: '',
      authCode: '',
      newPassword: '',
      resetToken: '',
      timeLeft: 300,
      isLoading: false,
      isResending: false,
    }),

  // =================================================
  // 3. 비동기 액션 (Async Actions) - API 호출
  // =================================================

  // 1단계 - 인증코드 발송 요청
  requestResetCode: async () => {
    set({ isLoading: true })

    try {
      const { email } = get() // state에서 email 꺼내기

      // 1) 백엔드에 이메일 정보 전송
      // DTO: VerificationRequest.EmailOnly {email}
      await api.post('/auth/password/code', { email })

      // 2) 성공 시 타이머 초기화, 다음 단계로 전환
      set({ step: 2, timeLeft: 300 })
      return true
    } catch (error) {
      alert(error.response?.data?.message || '인증번호 발송에 실패했습니다.')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // 2단계 - 인증코드 검증
  verifyResetCode: async () => {
    set({ isLoading: true })

    try {
      const { email, authCode } = get()

      // 1) 백엔드에 이메일, 인증번호 전송
      // DTO: VerificationRequest.Code {email, authCode}
      const response = await api.post('/auth/password/verify', {
        email,
        authCode,
      })

      // 2) 응답: {status: "SUCCESS", data: {resetToken: "..."}}
      const { resetToken } = response.data.data

      // 임시 토큰 저장 후 다음 단계로 전환
      alert('인증 성공!')
      set({ resetToken, step: 3 })
      return true
    } catch (error) {
      alert(error.response?.data?.message || '인증 실패')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // 인증번호 재발송
  resendResetCode: async () => {
    set({ isResending: true })

    try {
      const { email } = get()

      await api.post('/auth/password/resend', { email })

      // 타이머, 입력한 인증번호 초기화
      set({ timeLeft: 300, authCode: '' })

      return true
    } catch (error) {
      alert(error.response?.data?.message || '인증번호 발송에 실패했습니다.')
      return false
    } finally {
      setTimeout(() => set({ isResending: false }), 3000)
    }
  },

  // 3단계 - 비밀번호 변경
  resetPassword: async (navigate) => {
    set({ isLoading: true })
    try {
      const { email, resetToken, newPassword } = get()

      // DTO: PasswordRequest.Reset {email, resetToken, newPassword}
      await api.patch('/auth/password/reset', {
        email,
        resetToken,
        newPassword,
      })

      alert('비밀번호가 변경되었습니다.')
      navigate('/auth/signin')
      return true
    } catch (error) {
      alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.')
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useResetPasswordStore
