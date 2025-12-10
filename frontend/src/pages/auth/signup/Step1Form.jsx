import React from 'react'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'
import useSignUpStore from '../../../stores/auth/useSignUpStore'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthMutations } from '../../../hooks/auth/useAuthMutations'

export default function Step1Form() {
  // UI 상태
  const {
    formData,
    setFormData,
    errors,
    successes,
    checkLoading,
    setCheckLoading,
  } = useSignUpStore()

  const {
    googleLogin,
    checkEmail,
    checkNickname,
    requestSignupCode,
    isSignupPending,
  } = useAuthMutations()

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!formData.email) return
    setCheckLoading('email', true) // 로딩 UI 켜기
    try {
      await checkEmail(formData.email)
    } finally {
      setCheckLoading('email', false)
    }
  }

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!formData.nickname) return
    setCheckLoading('nickname', true) // 로딩 UI 켜기
    try {
      await checkNickname(formData.nickname)
    } finally {
      setCheckLoading('nickname', false)
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    requestSignupCode(formData)
  }

  return (
    <>
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

      <form onSubmit={handleNext} className="space-y-6">
        {/* 이메일 */}
        <FormInput
          name="email"
          label="이메일"
          type="email"
          value={formData?.email}
          placeholder="이메일을 입력해 주세요."
          onChange={(e) => setFormData('email', e.target.value)}
          error={errors.email}
          success={successes.email}
          onCheck={handleCheckEmail}
          isChecking={checkLoading.email}
        />
        {/* 비밀번호 */}
        <FormInput
          name="password"
          label="비밀번호"
          type="password"
          value={formData.password}
          placeholder="비밀번호를 입력해 주세요."
          onChange={(e) => setFormData('password', e.target.value)}
          error={errors?.password}
        />
        {/* 닉네임 */}
        <FormInput
          name="nickname"
          label="닉네임"
          value={formData.nickname}
          placeholder="닉네임을 입력해 주세요."
          onChange={(e) => setFormData('nickname', e.target.value)}
          error={errors?.nickname}
          success={successes.nickname}
          onCheck={handleCheckNickname}
          isChecking={checkLoading.nickname}
        />
        {/* 폼 제출 */}
        <FormButton
          type="submit"
          text="인증번호 받기"
          isLoading={isSignupPending}
        />
      </form>
    </>
  )
}
