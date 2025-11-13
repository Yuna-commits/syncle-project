import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 인증 관련 라우트 그룹 */}
      <Route path="/auth/*" element={<AuthRoutes />} />
    </Routes>
  )
}
