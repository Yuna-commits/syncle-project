import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SignInPage from '../pages/auth/SignInPage'
import SignUpPage from '../pages/auth/SignUpPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import AuthLayout from '../layouts/AuthLayout'
import EmailVerificationPage from '../pages/auth/EmailVerificationPage'
import InviteAcceptPage from '../pages/auth/InviteAcceptPage'

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="invite/accept" element={<InviteAcceptPage />} />
        <Route path="verify-email" element={<EmailVerificationPage />} />
      </Route>
    </Routes>
  )
}
