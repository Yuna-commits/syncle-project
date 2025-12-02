import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useResetPasswordStore from '../../stores/auth/useResetPasswordStore'
import Step1Email from './reset-password/Step1Email'
import Step2Verify from './reset-password/Step2Verify'
import Step3NewPassword from './reset-password/Step3NewPassword'

export default function ResetPassword() {
  const { step, reset } = useResetPasswordStore()

  // 페이지에서 나가면 상태 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  // 단계별 타이틀 설정
  const getTitle = () => {
    if (step === 1) return '비밀번호를 잊으셨나요?'
    if (step === 2) return '인증번호 입력'
    return '새 비밀번호 설정'
  }

  const getSubTitle = () => {
    if (step === 1) return '가입하신 이메일을 입력해주세요.'
    if (step === 2) return '이메일로 전송된 코드를 입력해주세요.'
    return '새로운 비밀번호를 입력해주세요.'
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800">
          {getTitle()}
        </h1>
        <p className="text-sm text-gray-500">{getSubTitle()}</p>
      </div>

      {/* 단계별 컴포넌트 교체 */}
      {step === 1 && <Step1Email />}
      {step === 2 && <Step2Verify />}
      {step === 3 && <Step3NewPassword />}

      {/* 로그인으로 돌아가지 */}
      <p className="mt-5 text-left text-sm text-gray-700">
        비밀번호가 기억나셨나요?{' '}
        <Link to="/auth/signin" className="text-blue-500 hover:text-blue-600">
          로그인하러 가기
        </Link>
      </p>
    </>
  )
}
