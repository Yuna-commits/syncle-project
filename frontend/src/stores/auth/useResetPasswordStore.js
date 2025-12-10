import { create } from 'zustand'

const useResetPasswordStore = create((set) => ({
  step: 1,
  email: '',
  authCode: '',
  newPassword: '',
  resetToken: '',
  timeLeft: 300, // 5분

  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setAuthCode: (code) => set({ authCode: code }),
  setNewPassword: (password) => set({ newPassword: password }),
  setResetToken: (token) => set({ resetToken: token }),

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
    }),
}))

export default useResetPasswordStore
