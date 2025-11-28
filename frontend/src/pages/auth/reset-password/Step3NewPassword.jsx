import React from 'react'
import { useNavigate } from 'react-router-dom'
import useResetPasswordStore from '../../../stores/useResetPasswordStore'
import AuthInput from '../../../components/auth/AuthInput'
import FormButton from '../../../components/auth/FormButton'

function Step3NewPassword() {
  const navigate = useNavigate()

  const { newPassword, setNewPassword, resetPassword, isLoading } =
    useResetPasswordStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await resetPassword(navigate)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthInput
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
        isLoading={isLoading}
      />
    </form>
  )
}

export default Step3NewPassword
