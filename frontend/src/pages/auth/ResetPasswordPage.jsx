import React from 'react'
import { Link } from 'react-router-dom'
import AuthInput from '../../components/auth/AuthInput'
import FormButton from '../../components/auth/FormButton'

export default function ResetPassword() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800">
          비밀번호를 잊으셨나요?
        </h1>
        <p className="text-sm text-gray-500">
          이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

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
        <FormButton type="submit" text="재설정 링크 보내기" />
      </form>

      {/* 하단 링크 */}
      <p className="mt-5 text-left text-sm text-gray-700">
        비밀번호가 기억나셨나요?{' '}
        <Link to="/auth/signin" className="text-blue-500 hover:text-blue-600">
          로그인하러 가기
        </Link>
      </p>
    </>
  )
}
