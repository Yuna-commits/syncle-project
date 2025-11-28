import React from 'react'
import googleIcon from '../../../assets/icons/google.svg'
import useSignUpStore from '../../../stores/useSignUpStore'
import AuthSocialButton from '../AuthSocialButton'
import AuthInput from '../AuthInput'

export default function Step1Form() {
  const formData = useSignUpStore((state) => state.formData)
  const errors = useSignUpStore((state) => state.errors)
  const setFormData = useSignUpStore((state) => state.setFormData)
  const requestSignupCode = useSignUpStore((state) => state.requestSignupCode)

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
      <AuthSocialButton text="Google로 로그인하기" icon={googleIcon} />
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
          value={formData.email}
          placeholder="이메일을 입력해 주세요."
          onChange={handleChange}
          error={errors.email}
        />
        {/* 비밀번호 */}
        <AuthInput
          name="password"
          label="비밀번호"
          type="password"
          value={formData.password}
          placeholder="비밀번호를 입력해 주세요."
          onChange={handleChange}
          error={errors.password}
        />
        {/* 닉네임 */}
        <AuthInput
          name="nickname"
          label="닉네임"
          value={formData.nickname}
          placeholder="닉네임을 입력해 주세요."
          onChange={handleChange}
          error={errors.nickname}
        />
        {/* 폼 제출 */}
        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600"
        >
          인증번호 받기
        </button>
      </form>
    </>
  )
}
