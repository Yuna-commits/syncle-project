import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import MainRoutes from './MainRoutes'
import ProfileRoutes from './ProfileRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 메인(대시보드) */}
      <Route path="/*" element={<MainRoutes />} />
      {/* 인증 */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      {/* 프로필 */}
      <Route path="/profile/*" element={<ProfileRoutes />} />
    </Routes>
  )
}
