import api from './AxiosInterceptor'

export const authApi = {
  // 이메일 로그인
  login: (credentials) => api.post('/auth/login', credentials),

  // 구글 로그인
  googleLogin: (idToken) => api.post('/auth/login/google', idToken),

  // 회원가입
  signup: (data) => api.post('/auth/signup', data),

  // 로그아웃
  logout: () => api.post('/auth/logout'),

  // 인증 코드 발송/재발송
  sendCode: (email, type, isResend) => {
    // type: 'SIGNUP' || 'PASSWORD_RESET'
    const url = isResend
      ? type === 'SIGNUP'
        ? '/auth/signup/resend'
        : '/auth/password/resend'
      : '/auth/password/code'
    return api.post(url, { email })
  },

  // 회원가입/비밀번호 인증 코드 검증
  verifyCode: (email, authCode, type) => {
    const url =
      type === 'SIGNUP' ? '/auth/signup/verify' : '/auth/password/verify'
    return api.post(url, { email, authCode })
  },

  // 비밀번호 재설정 (비로그인 상태)
  resetPassword: (email, resetToken, newPassword) =>
    api.patch('/auth/password/reset', {
      email,
      resetToken,
      newPassword,
    }),

  // 계정 복구
  reactivate: (data) => api.post('/users/reactivate', data),

  // 이메일 중복 확인
  checkEmail: (email) => api.get(`/users/check-email?email=${email}`),

  // 닉네임 중복 확인
  checkNickname: (nickname) =>
    api.get(`/users/check-nickname?nickname=${nickname}`),

  // 인증 메일 전송 (로그인 상태)
  sendEmailVerificationLink: (email) =>
    api.post('/auth/email/verification', { email }),

  // 이메일 인증 확인 (링크 클릭 시 호출)
  verifyEmailLink: (token) =>
    api.post('/auth/email/verify', null, { params: { token } }),

  // 구글 계정 연동
  linkGoogle: (token) => api.post('/auth/link/google', token),
}
