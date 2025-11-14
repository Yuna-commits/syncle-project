import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import ProfileRoutes from './ProfileRoutes'
import DashboardPage from '../pages/main/DashboardPage'
import NotificationPage from '../pages/main/NotificationPage'
import MainLayout from '../layouts/MainLayout'
import DashboardRoutes from './DashboardRoutes'
import BoardRoutes from './BoardRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 메인(대시보드) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="/notifications/*" element={<NotificationPage />} />
      </Route>
      {/* 인증 */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      {/* 프로필 */}
      <Route path="/profile/*" element={<ProfileRoutes />} />
      <Route path="/board/*" element={<BoardRoutes />} />
    </Routes>
  )
}
