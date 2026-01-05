import React, { useEffect } from 'react'
import useSignUpStore from '../../../stores/auth/useSignUpStore'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'
import { useAuthMutations } from '../../../hooks/auth/useAuthMutations'
import { useForm } from 'react-hook-form'
import { formatTimer } from '../../../utils/dateUtils'

export default function Step2Form() {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { authCode: '' },
  })

  // Zustand Store에서 상태와 액션 꺼내기
  const {
    email,
    timeLeft,
    decreaseTime,
    setStep, // 뒤로가기
  } = useSignUpStore()

  const {
    verifySignup,
    resendSignupCode,
    isVerifySignupPending,
    isResendSignupPending,
  } = useAuthMutations()

  // 타이머 (2단계일 때만 동작)
  useEffect(() => {
    if (timeLeft <= 0) {
      alert('입력 시간이 초과되었습니다.')
      setStep(1)
    }

    const timerId = setInterval(() => {
      decreaseTime() // 스토어의 시간을 1초씩 감소
    }, 1000)

    return () => clearInterval(timerId)
  }, [timeLeft, decreaseTime, setStep])

  // 재전송 핸들러
  const handleResend = () => {
    resendSignupCode(email)
  }

  // 제출 핸들러
  const onSubmit = (data) => {
    if (timeLeft <= 0) {
      alert('입력 시간이 초과되었습니다.')
      setStep(1)
    }
    verifySignup(
      { email, authCode: data.authCode },
      {
        onError: (error) => {
          const errorCode = error.response?.data?.errorCode

          if (errorCode === 'A004') {
            setError('authCode', {
              type: 'manual',
              message: '인증번호가 일치하지 않습니다.',
            })
            setValue('authCode', '')
            setFocus('authCode')
          }
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 안내 문구 */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-blue-600">{email}</span> 으로
          <br />
          인증번호가 발송되었습니다.
        </p>
      </div>

      {/* 인증번호 입력 구역 */}
      <div className="space-y-1">
        <FormInput
          type="text"
          placeholder="인증번호 6자리"
          maxLength={6}
          error={errors.authCode?.message}
          className="pr-2 text-center text-lg tracking-[0.2em]"
          {...register('authCode', {
            required: '인증번호를 입력해주세요.',
            pattern: {
              value: /^[0-9]{6}$/,
              message: '숫자 6자리를 입력해주세요.',
            },
          })}
        >
          {/* 타이머 */}
          <span className="absolute top-1/2 right-4 -translate-y-1/2 font-mono text-sm font-semibold text-red-500 tabular-nums">
            {formatTimer(timeLeft)}
          </span>
        </FormInput>
      </div>

      {/* 버튼 구역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 재전송 */}
        <FormButton
          type="button"
          text={`${isResendSignupPending ? '전송 중...' : '재전송'}`}
          variant="secondary"
          onClick={handleResend}
          isLoading={isResendSignupPending}
        />
        <FormButton
          type="submit"
          text="인증하기"
          isLoading={isVerifySignupPending}
          disabled={!isValid || timeLeft === 0}
        />
      </div>
    </form>
  )
}
