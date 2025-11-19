import React from 'react'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthFooter from '../../components/auth/AuthFooter'

export default function ResetPassword() {
  return (
    <>
      <AuthHeader
        title="비밀번호를 잊으셨나요?"
        subtitle="이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다."
      />

      {/* 폼 */}
      <form className="space-y-6">
        <AuthInput
          id="email"
          type="email"
          label="이메일"
          placeholder="이메일을 입력해 주세요."
          required
        />

        {/* 폼 제출 */}
        <button className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:cursor-pointer hover:bg-blue-600">
          재설정 링크 보내기
        </button>
      </form>

      {/* 하단 링크 */}
      <AuthFooter
        text="비밀번호가 기억나셨나요?"
        linkText="로그인하러 가기"
        to="/auth/signin"
      />
    </>
  )
}
