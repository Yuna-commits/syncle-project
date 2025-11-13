import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SignIn from '../pages/auth/SignIn'
import SignUp from '../pages/auth/SignUp'
import ResetPassword from '../pages/auth/ResetPassword'

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="reset-password" element={<ResetPassword />} />
    </Routes>
  )
}
