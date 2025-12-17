import { create } from 'zustand'

const useSignUpStore = create((set) => ({
  step: 1,
  email: '', // Step2 인증용
  timeLeft: 300, // 5분

  errors: {}, // 에러 메시지
  successes: {}, // 성공 메시지

  // 단계 이동
  setStep: (step) => set({ step }),

  // Step1에서 폼 제출 성공 시 이메일만 저장
  setEmail: (email) => set({ email }),

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
      email: '',
      timeLeft: 300,
      errors: {},
      successes: {},
    }),
}))

export default useSignUpStore
