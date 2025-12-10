import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import FormInput from '../../components/common/FormInput'
import FormButton from '../../components/common/FormButton'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'

export default function SignIn() {
  const { login, googleLogin, isLoginPending } = useAuthMutations()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isKeepLogin, setIsKeepLogin] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ ...formData, isKeepLogin })
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
        onSuccess={(credentialResponse) =>
          googleLogin(credentialResponse.credential)
        }
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
        <FormInput
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          label="이메일"
          placeholder="이메일을 입력해 주세요."
        />
        {/* 비밀번호 */}
        <FormInput
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
              checked={isKeepLogin}
              onChange={(e) => setIsKeepLogin(e.target.checked)}
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
        <FormButton type="submit" text="로그인" isLoading={isLoginPending} />
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
