import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'
import AuthFooterLink from '../../components/auth/AuthFooterLink'

export default function ResetPassword() {
  return (
    <AuthLayout>
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

        <AuthButton text="재설정 링크 보내기" />
      </form>

      {/* 하단 링크 */}
      <AuthFooterLink
        text="비밀번호가 기억나셨나요?"
        linkText="로그인하러 가기"
        to="/auth/signin"
      />
    </AuthLayout>
  )
}
