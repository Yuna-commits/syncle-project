import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import MainRoutes from './MainRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<MainRoutes />} />
      {/* 인증 관련 라우트 그룹 */}
      <Route path="/auth/*" element={<AuthRoutes />} />
    </Routes>
  )
}
