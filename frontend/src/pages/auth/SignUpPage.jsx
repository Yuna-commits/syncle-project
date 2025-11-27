import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import googleIcon from '../../assets/icons/google.svg'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthFooter from '../../components/auth/AuthFooter'
import AuthSocialButton from '../../components/auth/AuthSocialButton'
import api from '../../api/AxiosInterceptor'

export default function SignUp() {
  const navigate = useNavigate()

  // 회원가입 단계 (1: 정보입력, 2: 인증코드 입력)
  const [step, setStep] = useState(1)

  // 입력값 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
  })

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false)

  // 2단계 상태 관리 (코드, 재전송, 타이머)
  const [authCode, setAuthCode] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5분

  // 필드별 에러 메시지 상태
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')

  // 타이머 (2단계일 때만 동작)
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timerId)
    } else if (timeLeft === 0) {
      setGlobalError('인증 시간이 만료되었습니다. 재전송해주세요.')
    }
  }, [step, timeLeft])

  // 시간 포맷팅 (300 -> "05:00")
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // 사용자가 다시 입력을 시작하면 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  // ============================================================
  // Step 1: 인증코드 발송 요청
  // ============================================================
  const handleSendCode = async (e) => {
    e.preventDefault()
    // 에러 초기화
    setErrors({})
    setGlobalError('')

    try {
      // 1) 백엔드에 가입 정보 전송
      await api.post('/auth/signup', formData)

      // 2) 성공 시 타이머 초기화, 다음 단계로 전환
      setTimeLeft(300)
      setStep(2)
    } catch (error) {
      // 예외 메시지 표시
      console.error('가입 요청 실패: ', error)
      const response = error.response?.data

      // 1) @Valid 검증 실패 (응답 데이터에 errors 리스트가 있는지 확인)
      if (response?.data && Array.isArray(response.data)) {
        const newErrors = {}

        // [{"field": "email", "reason": "..."}] -> { email: "..." } 변환
        response.data.forEach((err) => {
          newErrors[err.field] = err.reason
        })
        setErrors(newErrors)
      }
      // 2) 중복 이메일, 닉네임
      else if (response?.errorCode === 'U002') {
        setErrors({ email: response.message })
      } else if (response?.errorCode === 'U003') {
        setErrors({ nickname: response.message })
      }
      // 3) 그 외
      else {
        setGlobalError(
          response?.message || '회원가입 요청 중 문제가 발생했습니다.',
        )
      }
    }
  }

  // ============================================================
  // Step 2: 인증코드 검증 및 자동 로그인
  // ============================================================
  const handleVerify = async (e) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setGlobalError('')

    try {
      // 1) 백엔드에 인증코드 전송
      const response = await api.post('/auth/signup/verify', {
        email: formData.email,
        authCode: authCode,
      })

      // 2) 자동 로그인 처리 (로그인 API와 동일)
      // LoginResponse { status: "SUCCESS", data: {accessToken: {...}, refreshToken: {...}}}
      const { accessToken, refreshToken } = response.data.data

      // 3) 토큰 저장 (Local Storage)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // 4) 메인으로 이동
      alert(`환영합니다. ${formData.nickname}님! 가입이 완료되었습니다.`)
      navigate('/dashboard')
    } catch (error) {
      console.error('인증 실패: ', error)
      const errorCode = error.response?.data?.errorCode

      if (errorCode === 'A005') {
        setGlobalError(
          '인증 시간이 만료되었습니다. 처음부터 다시 시도해주세요.',
        )
        setTimeout(() => setStep(1), 2000)
      } else if (errorCode === 'A004') {
        setErrors('인증 코드가 일치하지 않습니다. 다시 확인해주세요.')
      } else {
        setGlobalError('인증에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 인증코드 재전송 핸들러
  const handleResend = async () => {
    if (isResending) return

    setIsResending(true)
    setGlobalError('')

    try {
      await api.post('/auth/signup/resend', {
        email: formData.email,
      })

      setAuthCode('')
      setTimeLeft(300) // 타이머 초기화
    } catch (error) {
      console.error('재전송 실패: ', error)
      const response = error.response?.data

      if (response?.errorCode === 'A006') {
        alert(response.message)
        navigate('/auth/signin')
      } else {
        setGlobalError(response?.message || '메일 재전송에 실패했습니다.')
      }
    } finally {
      setTimeout(() => setIsResending(false), 3000)
    }
  }

  // ============================================================
  // 화면 렌더링
  // ============================================================
  return (
    <>
      <AuthHeader
        title={step === 1 ? '회원가입' : '이메일 인증'}
        subtitle={
          step === 1
            ? 'NullPointer와 함께 협업을 시작해보세요.'
            : '이메일로 전송된 코드를 입력해주세요.'
        }
      />

      {/* 글로벌 에러 메시지 */}
      {globalError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {globalError}
        </div>
      )}

      {/* Google로 로그인하기 */}
      {step === 1 && (
        <>
          <AuthSocialButton text="Google로 로그인하기" icon={googleIcon} />
          <div className="relative py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">Or</span>
            </div>
          </div>
        </>
      )}

      {/* 1단계: 회원가입 정보 입력 */}
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-6">
          {/* 이메일 */}
          <AuthInput
            id="email"
            name="email"
            label="이메일"
            type="email"
            value={formData.email}
            placeholder="이메일을 입력해 주세요."
            onChange={handleChange}
            error={errors.email}
            required
          />
          {/* 비밀번호 */}
          <AuthInput
            id="password"
            name="password"
            label="비밀번호"
            type="password"
            value={formData.password}
            placeholder="비밀번호를 입력해 주세요."
            onChange={handleChange}
            error={errors.password}
            required
          />
          {/* 닉네임 */}
          <AuthInput
            id="nickname"
            name="nickname"
            label="닉네임"
            value={formData.nickname}
            placeholder="닉네임을 입력해 주세요."
            onChange={handleChange}
            error={errors.nickname}
            required
          />
          {/* 폼 제출 */}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600"
          >
            인증번호 받기
          </button>
        </form>
      )}

      {/* 2단계: 인증번호 입력 */}
      {step === 2 && (
        <form onSubmit={handleVerify} className="space-y-6">
          {/* 인증번호 입력 구역 */}
          <div className="relative">
            <AuthInput
              id="authCode"
              name="authCode"
              label="인증번호"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder={'인증번호 6자리를 입력해주세요.'}
              maxLength={6}
              required
              error={errors.authCode || globalError}
              className="text-center text-lg tracking-widest"
            >
              {/* 타이머 */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-red-500 tabular-nums">
                {formatTime(timeLeft)}
              </div>
            </AuthInput>
          </div>

          {/* 버튼 구역 */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600"
            >
              인증하기
            </button>
            {/* 재전송 */}
            <button
              type="button"
              onClick={handleResend}
              className={`inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition ${isResending ? 'cursor-not-allowed text-gray-400' : ' text-blue-500 hover:cursor-pointer hover:bg-gray-200 '}`}
            >
              {isResending ? '전송 중...' : '인증번호 재전송'}
            </button>
          </div>

          {/* 뒤로가기 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-gray-500 underline hover:cursor-pointer hover:text-gray-700"
          >
            이메일을 잘못 입력하셨나요?
          </button>
        </form>
      )}

      {/* 로그인 링크 */}
      <AuthFooter
        text="이미 계정이 있으신가요?"
        linkText="로그인하러 가기"
        to="/auth/signin"
      />
    </>
  )
}
