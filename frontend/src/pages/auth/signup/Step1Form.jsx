import React from 'react'
import AuthInput from '../../../components/auth/AuthInput'
import FormButton from '../../../components/auth/FormButton'
import useSignUpStore from '../../../stores/useSignUpStore'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import useSignInStore from '../../../stores/useSignInStore'

export default function Step1Form() {
  const navigate = useNavigate()

  const { formData, errors, isLoading, setFormData, requestSignupCode } =
    useSignUpStore()

  const googleLogin = useSignInStore((state) => state.googleLogin)

  const handleChange = (e) => {
    setFormData(e.target.name, e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await requestSignupCode() // Store의 비동기 액션 호출
    if (success) {
      alert('인증 코드가 발송되었습니다.')
    }
  }

  return (
    <>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이메일 */}
        <AuthInput
          name="email"
          label="이메일"
          type="email"
          value={formData?.email}
          placeholder="이메일을 입력해 주세요."
          onChange={handleChange}
          error={errors?.email}
        />
        {/* 비밀번호 */}
        <AuthInput
          name="password"
          label="비밀번호"
          type="password"
          value={formData?.password}
          placeholder="비밀번호를 입력해 주세요."
          onChange={handleChange}
          error={errors?.password}
        />
        {/* 닉네임 */}
        <AuthInput
          name="nickname"
          label="닉네임"
          value={formData?.nickname}
          placeholder="닉네임을 입력해 주세요."
          onChange={handleChange}
          error={errors?.nickname}
        />
        {/* 폼 제출 */}
        <FormButton type="submit" text="인증번호 받기" isLoading={isLoading} />
      </form>
    </>
  )
}
