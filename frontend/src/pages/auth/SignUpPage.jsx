import React, { useEffect } from 'react'
import AuthHeader from '../../components/auth/AuthHeader'
import AuthFooter from '../../components/auth/AuthFooter'
import useSignUpStore from '../../stores/useSignUpStore'
import Step1Form from '../../components/auth/signup/Step1Form'
import Step2Form from '../../components/auth/signup/Step2Form'

export default function SignUp() {
  // Zustand Store에서 상태와 액션 꺼내기
  const step = useSignUpStore((state) => state.step)
  const reset = useSignUpStore((state) => state.reset)
  const globalError = useSignUpStore((state) => state.globalError)

  // 페이지에서 나가면 상태 초기화
  useEffect(() => {
    return () => reset()
  }, [reset])

  return (
    <>
      <AuthHeader
        title={step === 1 ? '회원가입' : '이메일 인증'}
        subtitle={
          step === 1
            ? 'NullPointer와 함께 협업을 시작해보세요.'
            : '이메일로 전송된 번호를 입력해주세요.'
        }
      />

      {/* 글로벌 에러 메시지 */}
      {globalError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {globalError}
        </div>
      )}

      {/* 1단계: 회원가입 정보 입력 */}
      {/* 2단계: 인증번호 입력 */}
      {step === 1 ? <Step1Form /> : <Step2Form />}

      {/* 로그인 링크 */}
      <AuthFooter
        text="이미 계정이 있으신가요?"
        linkText="로그인하러 가기"
        to="/auth/signin"
      />
    </>
  )
}
