import React from 'react'
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

  // 회원가입 단계 관리 (1: 정보입력, 2: 인증코드 입력)
  const [step, setStep] = useState(1)

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
  })

  // 2단계 인증 코드 관리
  const [authCode, setAuthCode] = useState('')

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // ============================================================
  // Step 1: 인증코드 발송 요청
  // ============================================================
  const handleSendCode = async (e) => {
    e.preventDefault()

    try {
      // 1) 백엔드에 가입 정보 전송
      await api.post('/auth/signup/code', {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      })

      // 2) 성공 시 다음 단계로 전환
      alert('인증 코드가 이메일로 발송되었습니다.')
      setStep(2)
    } catch (error) {
      console.error('가입 요청 실패: ', error)
      alert('회원가입 요청 중 오류가 발생했습니다.')
    }
  }

  // ============================================================
  // Step 2: 인증코드 검증 및 자동 로그인
  // ============================================================
  const handleVerify = async (e) => {
    e.preventDefault()

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
        alert('인증 시간이 만료되었습니다. 다시 가입해주세요.')
        setStep(1)
      } else if (errorCode === 'A004') {
        alert('인증 코드가 일치하지 않습니다. 다시 확인해주세요.')
      } else {
        alert('인증에 실패했습니다.')
      }
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

      {/* Google로 로그인하기 */}
      <AuthSocialButton text="Google로 로그인하기" icon={googleIcon} />

      {/* 구분선 */}
      <div className="relative py-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">Or</span>
        </div>
      </div>

      {/* 1단계: 회원가입 정보 입력 */}
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-6">
          {/* 닉네임 */}
          <AuthInput
            id="nickname"
            name="nickname"
            label="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력해 주세요."
          />
          {/* 이메일 */}
          <AuthInput
            id="email"
            name="email"
            label="이메일"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력해 주세요."
          />
          {/* 비밀번호 */}
          <AuthInput
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
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
          <div className="text-left">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              인증 코드 (6자리)
            </label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-center text-lg tracking-widest focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600"
          >
            인증하기
          </button>

          {/* 다시 입력하기 (뒤로가기) */}
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
