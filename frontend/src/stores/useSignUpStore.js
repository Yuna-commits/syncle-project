import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useSignUpStore = create((set, get) => ({
  // ==========================================
  // 1. 상태 (State)
  // ==========================================

  step: 1,
  formData: { email: '', password: '', nickname: '' },
  authCode: '',
  isResending: false, // 재전송 버튼 로딩 상태
  timeLeft: 300, // 5분
  errors: {},
  globalError: '',

  // ==========================================
  // 2. 동기 액션 (Actions) - 단순 값 변경
  // ==========================================

  // 단계 이동
  setStep: (step) => set({ step }),

  // 입력값 변경
  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
      // 입력 시 해당 필드 에러 제거
      errors: { ...state.errors, [name]: '' },
    })),

  setAuthCode: (code) => set({ authCode: code }),

  // 타이머
  setTimeLeft: (time) => set({ timeLeft: time }),
  decreaseTime: () => set((state) => ({ timeLeft: state.timeLeft - 1 })),

  // 로딩 상태
  setIsResending: (isResending) => set({ isResending }),

  // 에러 처리
  setErrors: (errors) => set({ errors }),
  setGlobalError: (msg) => set({ globalError: msg }),
  clearErrors: () => set({ errors: {}, globalError: '' }),

  // 초기화 (컨포넌트 언마운트 시 사용)
  reset: () =>
    set({
      step: 1,
      formData: { email: '', password: '', nickname: '' },
      authCode: '',
      timeLeft: 300,
      errors: {},
      globalError: '',
      isResending: false,
    }),

  // =================================================
  // 3. 비동기 액션 (Async Actions) - API 호출
  // =================================================

  // 1단계 - 인증코드 발송 요청
  requestSignupCode: async () => {
    set({ errors: {}, globalError: '' })

    try {
      const { formData } = get() // state에서 formData 꺼내기

      // 1) 백엔드에 가입 정보 전송
      await api.post('/auth/signup', formData)

      // 2) 성공 시 타이머 초기화, 다음 단계로 전환
      set({ step: 2, timeLeft: 300 })
      return true // 컴포넌트에 성공 여부 알림
    } catch (error) {
      // 예외 메시지 표시
      const response = error.response?.data

      // 1) @Valid 검증 실패 (응답 데이터에 errors 리스트가 있는지 확인)
      if (response?.data && Array.isArray(response.data)) {
        const newErrors = {}
        // [{"field": "email", "reason": "..."}] -> { email: "..." } 변환
        response.data.forEach((err) => {
          newErrors[err.field] = err.reason
        })
        set({ errors: newErrors })
      }
      // 2) 중복 이메일, 닉네임
      else if (response?.errorCode === 'U002') {
        set({ errors: { email: response.message } })
      } else if (response?.errorCode === 'U003') {
        set({ errors: { nickname: response.message } })
      }
      // 3) 그 외
      else {
        set({
          globalError:
            response?.message || '회원가입 요청 중 문제가 발생했습니다.',
        })
      }
      return false
    }
  },

  // 2단계 - 인증코드 검증 및 자동 로그인
  verifySignupCode: async () => {
    set({ errors: {}, globalError: '' })

    try {
      const { formData, authCode } = get() // state에서 데이터 추출

      // 1) 백엔드에 인증코드 전송
      const response = await api.post('/auth/signup/verify', {
        email: formData.email,
        authCode,
      })

      // 2) 자동 로그인 처리 (로그인 API와 동일)
      // LoginResponse { status: "SUCCESS", data: {accessToken: {...}, refreshToken: {...}}}
      const { accessToken, refreshToken } = response.data.data

      // 3) 토큰 저장 (Local Storage)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      return true
    } catch (error) {
      const errorCode = error.response?.data?.errorCode

      if (errorCode === 'A005') {
        set({
          globalError:
            '인증 시간이 만료되었습니다. 처음부터 다시 시도해주세요.',
        })
        setTimeout(() => set({ step: 1 }), 2000)
      } else if (errorCode === 'A004') {
        set({
          errors: {
            authCode: '인증 코드가 일치하지 않습니다. 다시 확인해주세요.',
          },
        })
      } else {
        set({ globalError: '인증에 실패했습니다. 다시 시도해주세요.' })
      }

      return false
    }
  },

  // 인증코드 재발송
  resendSignupCode: async (navigate) => {
    set({ isResending: true, globalError: '' })

    try {
      const { formData } = get()

      await api.post('/auth/signup/resend', {
        email: formData.email,
      })

      set({ timeLeft: 300, authCode: '' })

      return true
    } catch (error) {
      const response = error.response?.data

      if (response?.errorCode === 'A006') {
        alert(response.message)
        navigate('/auth/signin')
      } else {
        set({ globalError: '메일 재전송에 실패했습니다.' })
      }

      return false
    } finally {
      setTimeout(() => set({ isResending: false }), 3000)
    }
  },
}))

export default useSignUpStore
