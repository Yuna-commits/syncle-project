import React from 'react'
import { Link } from 'react-router-dom'
import googleIcon from '../../assets/icons/google.svg'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthFooter from '../../components/auth/AuthFooter'
import AuthSocialButton from '../../components/auth/AuthSocialButton'

export default function SignIn() {
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
        <button className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600">
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
