import React from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import googleIcon from '../../assets/icons/google.svg'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthFooter from '../../components/auth/AuthFooter'
import AuthSocialButton from '../../components/auth/AuthSocialButton'
import api from '../../api/AxiosInterceptor'

export default function SignIn() {
  const navigate = useNavigate()

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // 로그인 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault() // 새로고침 방지

    try {
      // 1) 백엔드 API 호출
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      })

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
      console.error('로그인 실패: ', error)

      const errorCode = error.response?.data?.errorCode

      if (errorCode === 'U007') {
        // 비활성 계정
        if (window.confirm('비활성화된 계정입니다. 복구하시겠습니까?')) {
          navigate('/auth/reactivate')
        }
      } else {
        alert('이메일 또는 비밀번호를 확인해주세요.')
      }
    }
  }

  return (
    <>
      <AuthHeader
        title="로그인"
        subtitle="이메일과 비밀번호를 입력해 계정에 로그인하세요."
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

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이메일 */}
        <AuthInput
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          label="이메일"
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

        {/* 로그인 상태 유지 / 비밀번호 찾기 */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-md border border-gray-300 checked:border-transparent checked:bg-blue-500"
            />
            <span className="text-sm text-gray-700">로그인 상태 유지</span>
          </label>
          <Link
            to="/auth/reset-password"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        {/* 폼 제출 */}
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600"
        >
          로그인
        </button>
      </form>

      {/* 회원가입 링크 */}
      <AuthFooter
        text="아직 계정이 없으신가요?"
        linkText="회원가입하러 가기"
        to="/auth/signup"
      />
    </>
  )
}
