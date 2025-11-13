import React from 'react'
import { Link } from 'react-router-dom'
import googleIcon from '../../assets/icons/google.svg'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'
import AuthFooterLink from '../../components/auth/AuthFooterLink'
import SocialLoginButton from '../../components/auth/SocialLoginButton'

export default function SignIn() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 sm:p-0">
        <AuthHeader
          title="로그인"
          subtitle="이메일과 비밀번호를 입력해 계정에 로그인하세요."
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

        {/* 로그인 폼 */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
          <AuthButton text="Sign in" />
        </form>

        {/* 회원가입 링크 */}
        <AuthFooterLink
          text="아직 계정이 없으신가요?"
          linkText="회원가입하러 가기"
          to="/auth/signup"
        />
      </div>
    </AuthLayout>
  )
}
