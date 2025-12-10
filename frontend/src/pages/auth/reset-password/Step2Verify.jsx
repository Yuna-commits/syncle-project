import React, { useEffect } from 'react'
import useResetPasswordStore from '../../../stores/auth/useResetPasswordStore'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'
import { useAuthMutations } from '../../../hooks/auth/useAuthMutations'

function Step2Verify() {
  const { authCode, setAuthCode, timeLeft, decreaseTime, setStep } =
    useResetPasswordStore()

  const {
    verifyResetCode,
    resendResetCode,
    isVerifyResetPending,
    isResendResetPending,
  } = useAuthMutations()

  const { email } = useResetPasswordStore.getState() // 이메일 조회

  // 타이머 (2단계일 때만 동작)
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(decreaseTime, 1000)
      return () => clearInterval(timerId)
    } else if (timeLeft === 0) {
      alert('인증 시간이 만료되었습니다.')
      setStep(1)
    }
  }, [timeLeft, decreaseTime, setStep])

  // 시간 포맷팅 (300 -> "05:00")
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    verifyResetCode({ email, authCode })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <FormInput
          name="authCode"
          label="인증번호"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          placeholder="인증번호 6자리를 입력해주세요."
          maxLength={6}
          className="text-center text-lg tracking-widest"
        >
          {/* 타이머 */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-red-500 tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </FormInput>

        {/* 버튼 구역 */}
        <div className="mt-5 mb-5 grid grid-cols-2 gap-4">
          <FormButton
            type="submit"
            text="인증하기"
            isLoading={isVerifyResetPending}
            disabled={timeLeft === 0}
          />
          {/* 재전송 */}
          <FormButton
            type="button"
            text="재전송"
            variant="secondary"
            onClick={() => resendResetCode(email)}
            isLoading={isResendResetPending}
          />
        </div>
      </div>

      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full text-sm text-gray-500 underline hover:cursor-pointer hover:text-gray-700"
      >
        이메일을 잘못 입력하셨나요?
      </button>
    </form>
  )
}

export default Step2Verify
