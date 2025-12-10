import React from 'react'
import useResetPasswordStore from '../../../stores/auth/useResetPasswordStore'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'
import { useAuthMutations } from '../../../hooks/auth/useAuthMutations'

function Step3NewPassword() {
  const { newPassword, setNewPassword, email, resetToken } =
    useResetPasswordStore()

  const { resetPassword, isResetPasswordPending } = useAuthMutations()

  const handleSubmit = async (e) => {
    e.preventDefault()
    resetPassword({ email, resetToken, newPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        name="newPassword"
        type="password"
        label="새 비밀번호"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="비밀번호를 입력해주세요."
      />

      <FormButton
        type="submit"
        text="비밀번호 변경하기"
        isLoading={isResetPasswordPending}
      />
    </form>
  )
}

export default Step3NewPassword
