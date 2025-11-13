import React from 'react'
import googleIcon from '../../assets/icons/google.svg'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'
import AuthFooterLink from '../../components/auth/AuthFooterLink'
import SocialLoginButton from '../../components/auth/SocialLoginButton'

export default function SignUp() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 sm:p-0">
        <AuthHeader
          title="회원가입"
          subtitle="계정을 만들어 서비스를 시작해 보세요."
        />

        {/* Google로 로그인하기 */}
        <SocialLoginButton text="Google로 로그인하기" icon={googleIcon} />

        {/* 구분선 */}
        <div className="relative py-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-400">Or</span>
          </div>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* 닉네임 */}
          <AuthInput
            id="nickname"
            label="닉네임"
            placeholder="닉네임을 입력해 주세요."
            required
          />
          {/* 이메일 */}
          <AuthInput
            id="email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력해 주세요."
            required
          />
          {/* 비밀번호 */}
          <AuthInput
            id="password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
            required
          />
          {/* 폼 제출 */}
          <AuthButton text="회원가입" />
        </form>

        {/* 로그인 링크 */}
        <AuthFooterLink
          text="이미 계정이 있으신가요?"
          linkText="로그인하러 가기"
          to="/auth/signin"
        />
      </div>
    </AuthLayout>
  )
}
