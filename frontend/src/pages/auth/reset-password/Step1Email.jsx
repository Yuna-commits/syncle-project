import React from 'react'
import useResetPasswordStore from '../../../stores/auth/useResetPasswordStore'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'

function Step1Email() {
  const { email, setEmail, isLoading, requestResetCode } =
    useResetPasswordStore()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      alert('이메일을 입력해주세요.')
    }
    const success = await requestResetCode()
    if (success) {
      alert('인증번호가 발송되었습니다. 메일함을 확인해주세요.')
    }
  }

  return (
    <div>
      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          name="email"
          type="email"
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="가입하신 이메일을 입력해주세요."
        />

        {/* 폼 제출 */}
        <FormButton type="submit" text="인증번호 받기" isLoading={isLoading} />
      </form>
    </div>
  )
}

export default Step1Email
