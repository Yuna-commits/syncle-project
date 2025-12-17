import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth.api'
import useSignUpStore from '../../stores/auth/useSignUpStore'
import useResetPasswordStore from '../../stores/auth/useResetPasswordStore'

export const useAuthMutations = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Zustand Store 상태 변경 함수
  const {
    setStep: setSignUpStep,
    setTimeLeft: setSignUpTime,
    setErrors: setSignUpErrors,
    setSuccesses: setSignUpSuccesses,
  } = useSignUpStore()

  const {
    setStep: setResetStep,
    setTimeLeft: setResetTime,
    setResetToken,
    setAuthCode: setResetAuthCode,
  } = useResetPasswordStore()

  // --- 로그인 & 계정 복구 ---

  // 계정 복구
  const reactivateMutation = useMutation({
    mutationFn: authApi.reactivate,
    onSuccess: (res, variables) => {
      alert('계정이 복구되었습니다.')
      // 계정 복구 후 원래 시도했던 로그인 정보로 재로그인 시도
      loginMutation.mutate(variables)
    },
    onError: (error) => {
      const errorCode = error.response?.data?.errorCode
      if (errorCode === 'U001') {
        // USER_NOT_FOUND
        alert('존재하지 않거나 복구할 수 없는 계정입니다.')
      } else if (errorCode === 'U004') {
        alert('비밀번호가 일치하지 않습니다.')
      } else {
        alert('계정 복구에 실패했습니다.')
      }
    },
  })

  // 로그인
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authApi.login({ email, password }),
    onSuccess: (response, variables) => {
      const { accessToken, refreshToken } = response.data.data
      // 전달받은 리다이렉트 주소, 로그인 유지 여부 추출
      const { isKeepLogin, redirectTo } = variables

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

      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      alert('로그인 성공!')
      // 성공 시 요청된 페이지로 이동 (없으면 대시보드로)
      navigate(redirectTo || '/dashboard')
    },
    onError: (error, variables) => {
      const res = error.response?.data
      // 비활성 계정 복구
      if (res?.errorCode === 'U007') {
        if (window.confirm('비활성화된 계정입니다. 복구하시겠습니까?')) {
          reactivateMutation.mutate(variables)
        }
      } else {
        alert(res?.message || '이메일 또는 비밀번호를 확인해주세요.')
      }
    },
  })

  // 구글 로그인
  const googleLoginMutation = useMutation({
    mutationFn: ({ token }) => authApi.googleLogin(token),
    onSuccess: (res, variables) => {
      const { accessToken, refreshToken } = res.data.data
      const { redirectTo } = variables // 리다이렉트 주소 추출

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      alert('로그인 성공!')
      navigate(redirectTo || '/dashboard')
    },
    onError: () => alert('구글 로그인 처리에 실패했습니다.'),
  })

  // 로그아웃
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      localStorage.clear()
      sessionStorage.clear()
      queryClient.setQueryData(['user', 'me'], null)
      alert('로그아웃 되었습니다.')

      // 브라우저 자체 새로고침 + 메모리 초기화 + 뒤로가기 방지
      window.location.replace('/auth/signin')
    },
  })

  // --- 회원가입 ---

  // 이메일 중복 확인
  const checkEmailMutation = useMutation({
    mutationFn: authApi.checkEmail,
    onSuccess: (res) => {
      const isDuplicate = res.data.data
      if (isDuplicate) {
        setSignUpErrors({ email: '이미 사용 중인 이메일입니다.' })
        setSignUpSuccesses({ email: '' })
      } else {
        setSignUpErrors({ email: '' })
        setSignUpSuccesses({ email: '사용 가능한 이메일입니다.' })
      }
    },
  })

  // 닉네임 중복 확인
  const checkNicknameMutation = useMutation({
    mutationFn: authApi.checkNickname,
    onSuccess: (res) => {
      const isDuplicate = res.data.data
      if (isDuplicate) {
        setSignUpErrors({ nickname: '이미 사용 중인 닉네임입니다.' })
        setSignUpSuccesses({ nickname: '' })
      } else {
        setSignUpErrors({ nickname: '' })
        setSignUpSuccesses({ nickname: '사용 가능한 닉네임입니다.' })
      }
    },
  })

  // 1단계: 회원가입 정보 전송 & 인증번호 발송
  const requestSignupCodeMutation = useMutation({
    mutationFn: (formData) => authApi.signup(formData),
    onSuccess: () => {
      setSignUpStep(2)
      setSignUpTime(300) // 타이머 5분
    },
    onError: (error) => {
      const response = error.response?.data
      if (response?.data && Array.isArray(response.data)) {
        // Validation Error 처리
        const newErrors = {}
        response.data.forEach((err) => (newErrors[err.field] = err.reason))
        setSignUpErrors(newErrors)
      } else if (response?.errorCode === 'U002') {
        setSignUpErrors({ email: response.message })
      } else if (response?.errorCode === 'U003') {
        setSignUpErrors({ nickname: response.message })
      } else {
        alert(response?.message || '회원가입 요청 중 문제가 발생했습니다.')
      }
    },
  })

  // 2단계: 인증코드 검증 & 자동 로그인
  const verifySignupMutation = useMutation({
    mutationFn: ({ email, authCode }) =>
      authApi.verifyCode(email, authCode, 'SIGNUP'),
    onSuccess: (res) => {
      const { accessToken, refreshToken } = res.data.data

      sessionStorage.setItem('accessToken', accessToken)
      sessionStorage.setItem('refreshToken', refreshToken)

      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      alert('회원가입이 완료되었습니다!')
      navigate('/dashboard')
    },
    onError: (error) => {
      const errorCode = error.response?.data?.errorCode
      if (errorCode === 'A005') {
        // 만료
        alert('인증 시간이 만료되었습니다. 처음부터 다시 시도해주세요.')
        setTimeout(() => setSignUpStep(1), 2000)
      } else if (errorCode === 'A004') {
        return
      } else {
        alert('인증에 실패했습니다. 다시 시도해주세요.')
      }
    },
  })

  // 인증코드 재발송
  const resendSignupCodeMutation = useMutation({
    mutationFn: (email) => authApi.sendCode(email, 'SIGNUP', true),
    onSuccess: () => {
      setSignUpTime(300)
      alert('인증번호가 재발송되었습니다.')
    },
    onError: (err) => {
      if (err.response?.data?.errorCode === 'A006') {
        alert(err.response.data.message)
        navigate('/auth/signin')
      } else {
        alert('인증번호 발송에 실패했습니다.')
      }
    },
  })

  // --- 비밀번호 재설정 --

  // 1단계: 인증코드 발송
  const requestResetCodeMutation = useMutation({
    mutationFn: (email) => authApi.sendCode(email, 'PASSWORD_RESET', false),
    onSuccess: () => {
      setResetStep(2)
      setResetTime(300)
    },
    onError: (err) =>
      alert(err.response?.data?.message || '인증번호 발송 실패'),
  })

  // 2단계: 인증코드 검증
  const verifyResetCodeMutation = useMutation({
    mutationFn: ({ email, authCode }) =>
      authApi.verifyCode(email, authCode, 'PASSWORD_RESET'),
    onSuccess: (res) => {
      const { resetToken } = res.data.data
      setResetToken(resetToken)
      alert('인증 성공!')
      setResetStep(3)
    },
    onError: (err) => alert(err.response?.data?.message || '인증 실패'),
  })

  // 3단계: 비밀번호 변경
  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, resetToken, newPassword }) =>
      authApi.resetPassword(email, resetToken, newPassword),
    onSuccess: () => {
      alert('비밀번호가 변경되었습니다.')
      navigate('/auth/signin')
    },
    onError: (err) => alert(err.response?.data?.message || '변경 실패'),
  })

  // 인증코드 재발송
  const resendResetCodeMutation = useMutation({
    mutationFn: (email) => authApi.sendCode(email, 'PASSWORD_RESET', true),
    onSuccess: () => {
      setSignUpTime(300)
      setResetAuthCode('')
      alert('인증번호가 재발송되었습니다.')
    },
    onError: (err) => {
      if (err.response?.data?.errorCode === 'A006') {
        alert(err.response.data.message)
        navigate('/auth/signin')
      } else {
        alert('인증번호 발송에 실패했습니다.')
      }
    },
  })

  // --- 이메일 재인증 ---

  // 이메일 인증 메일 발송
  const sendEmailVerificationMutation = useMutation({
    mutationFn: authApi.sendEmailVerificationLink,
    onSuccess: () => alert('인증 메일이 재발송되었습니다.'),
    onError: (err) => alert(err.response?.data?.message || '메일 발송 실패'),
  })

  // 이메일 인증 링크 확인
  const verifyEmailLinkMutation = useMutation({
    mutationFn: authApi.verifyEmailLink,
    onSuccess: () => {
      // 인증 상태가 변경되었으므로 유저 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      alert('이메일 인증이 성공적으로 완료되었습니다.')
      navigate('/dashboard') // 또는 /profile/security 등 원하는 곳으로 이동
    },
    onError: (err) => {
      alert(err.response?.data?.message || '이메일 인증에 실패했습니다.')
      navigate('/dashboard') // 실패 시에도 대시보드 등으로 이동
    },
  })

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    reactivate: reactivateMutation.mutate,

    checkEmail: checkEmailMutation.mutateAsync,
    checkNickname: checkNicknameMutation.mutateAsync,
    requestSignupCode: requestSignupCodeMutation.mutate,
    verifySignup: verifySignupMutation.mutate,
    resendSignupCode: resendSignupCodeMutation.mutate,

    requestResetCode: requestResetCodeMutation.mutate,
    verifyResetCode: verifyResetCodeMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    resendResetCode: resendResetCodeMutation.mutate,

    sendEmailVerification: sendEmailVerificationMutation.mutate,
    verifyEmailLink: verifyEmailLinkMutation.mutate,

    // Pending States (UI 로딩용)
    isLoginPending: loginMutation.isPending,
    isSignupPending: requestSignupCodeMutation.isPending,

    isVerifySignupPending: verifySignupMutation.isPending,
    isResendSignupPending: resendSignupCodeMutation.isPending,

    isRequestResetPending: requestResetCodeMutation.isPending,
    isVerifyResetPending: verifyResetCodeMutation.isPending,
    isResendResetPending: resendResetCodeMutation.isPending,
    isResetPasswordPending: resetPasswordMutation.isPending,
  }
}
