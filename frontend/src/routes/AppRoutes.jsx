import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import MainLayout from '../layouts/MainLayout'

import DashboardPage from '../pages/main/DashboardPage'
import NotificationPage from '../pages/main/NotificationPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 인증 관련 라우트 그룹 */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      {/* 메인 레이아웃을 사용하는 라우트 */}
      <Route element={<MainLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notifications" element={<NotificationPage />} />
      </Route>
    </Routes>
  )
}
