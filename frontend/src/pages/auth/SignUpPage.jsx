import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useSignUpStore from '../../stores/auth/useSignUpStore'
import Step1Form from './signup/Step1Form'
import Step2Form from './signup/Step2Form'

export default function SignUp() {
  // Zustand Store에서 상태와 액션 꺼내기
  const { step, reset } = useSignUpStore()

  // 페이지에서 나가면 상태 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800">
          {step === 1 ? '회원가입' : '이메일 인증'}
        </h1>
        <p className="text-sm text-gray-500">
          {step === 1
            ? 'NullPointer와 함께 협업을 시작해보세요.'
            : '이메일로 전송된 번호를 입력해주세요.'}
        </p>
      </div>

      {/* 1단계: 회원가입 정보 입력 */}
      {/* 2단계: 인증번호 입력 */}
      {step === 1 ? <Step1Form /> : <Step2Form />}

      {/* 로그인 링크 */}
      <p className="mt-5 text-left text-sm text-gray-700">
        이미 계정이 있으신가요?{' '}
        <Link
          to="/auth/signin"
          className="font-semibold text-blue-500 hover:text-blue-600"
        >
          로그인하러 가기
        </Link>
      </p>
    </>
  )
}
