import { create } from 'zustand'

const useSignUpStore = create((set) => ({
  step: 1,
  formData: { email: '', password: '', nickname: '', authCode: '' },
  timeLeft: 300, // 5분

  checkLoading: { email: false, nickname: false }, // 중복 검사 로딩 상태

  errors: {}, // 에러 메시지
  successes: {}, // 성공 메시지

  // 단계 이동
  setStep: (step) => set({ step }),

  // 입력값 변경
  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
      // 입력 시 해당 필드 에러 제거
      errors: { ...(state.errors || {}), [name]: '' },
      successes: { ...(state.successes || {}), [name]: '' },
    })),

  setAuthCode: (code) => set({ authCode: code }),

  // 타이머
  setTimeLeft: (time) => set({ timeLeft: time }),
  decreaseTime: () => set((state) => ({ timeLeft: state.timeLeft - 1 })),

  setErrors: (newErrors) =>
    set((state) => ({ errors: { ...state.errors, ...newErrors } })),
  setSuccesses: (newSuccesses) =>
    set((state) => ({ successes: { ...state.successes, ...newSuccesses } })),

  setCheckLoading: (key, status) =>
    set((state) => ({
      checkLoading: { ...state.checkLoading, [key]: status },
    })),

  // 초기화 (컨포넌트 언마운트 시 사용)
  reset: () =>
    set({
      step: 1,
      formData: { email: '', password: '', nickname: '', authCode: '' },
      timeLeft: 300,
      errors: {},
      successes: {},
      checkLoading: { email: false, nickname: false },
    }),
}))

export default useSignUpStore
