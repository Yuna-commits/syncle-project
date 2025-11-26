import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SignInPage from '../pages/auth/SignInPage'
import SignUpPage from '../pages/auth/SignUpPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import AuthLayout from '../layouts/AuthLayout'

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  )
}
