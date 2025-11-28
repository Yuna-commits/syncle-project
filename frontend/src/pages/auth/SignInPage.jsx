import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthInput from '../../components/auth/AuthInput'
import useSignInStore from '../../stores/useSignInStore'
import FormButton from '../../components/auth/FormButton'
import { GoogleLogin } from '@react-oauth/google'

export default function SignIn() {
  const navigate = useNavigate()

  // Zustand Store에서 상태와 액션 꺼내기
  const {
    formData,
    setFormData,
    login,
    isLoading,
    googleLogin,
    isKeepLogin,
    toggleKeepLogin,
    reset,
  } = useSignInStore()

  // 페이지에서 나가면 상태 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  // 입력 핸들러
  const handleChange = (e) => {
    setFormData(e.target.name, e.target.value)
  }

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(navigate)
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800">로그인</h1>
        <p className="text-sm text-gray-500">
          이메일과 비밀번호를 입력해 계정에 로그인하세요.
        </p>
      </div>

      {/* Google로 로그인하기 */}
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // 로그인 성공 시 Store 액션 호출
          googleLogin(credentialResponse, navigate)
        }}
        onError={() => {
          alert('로그인에 실패했습니다.')
        }}
        theme="outline"
        shape="rectangular"
        size="large"
        width={380}
        text="Google로 로그인하기"
      />

      {/* 구분선 */}
      <div className="relative py-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이메일 */}
        <AuthInput
          name="email"
          type="email"
          value={formData?.email}
          onChange={handleChange}
          label="이메일"
          placeholder="이메일을 입력해 주세요."
        />
        {/* 비밀번호 */}
        <AuthInput
          name="password"
          type="password"
          value={formData?.password}
          onChange={handleChange}
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요."
        />

        {/* 로그인 상태 유지 / 비밀번호 찾기 */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isKeepLogin}
              onChange={toggleKeepLogin}
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
        <FormButton type="submit" text="로그인" isLoading={isLoading} />
      </form>

      {/* 회원가입 링크 */}
      <p className="mt-5 text-left text-sm text-gray-700">
        아직 계정이 없으신가요?{' '}
        <Link to="/auth/signup" className="text-blue-500 hover:text-blue-600">
          회원가입하러 가기
        </Link>
      </p>
    </>
  )
}
