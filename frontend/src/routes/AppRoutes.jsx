import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import ProfileRoutes from './ProfileRoutes'
import NotificationPage from '../pages/main/NotificationPage'
import MainLayout from '../layouts/MainLayout'
import BoardRoutes from './BoardRoutes'
import CalendarPage from '../pages/main/CalendarPage'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import TeamRoutes from './TeamRoutes'
import DashboardPage from '../pages/main/DashboardPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================================================= */}
      {/* 1. 공개 라우트 (로그인 안 한 사람만 접근 가능)       */}
      {/* ================================================= */}
      <Route element={<PublicRoute />}>
        {/* 인증 */}
        <Route path="/auth/*" element={<AuthRoutes />} />
      </Route>

      {/* ================================================= */}
      {/* 2. 보호된 라우트 (로그인 한 사람만 접근 가능)        */}
      {/* ================================================= */}
      <Route element={<ProtectedRoute />}>
        {/* 루트 접근 시 대시보드로 (비로그인 상태면 로그인 페이지로) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* 메인(대시보드) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="/notifications/*" element={<NotificationPage />} />
          <Route path="/calendar/*" element={<CalendarPage />} />

          {/* 팀 관련 라우트 */}
          <Route path="/teams/*" element={<TeamRoutes />} />
        </Route>
        {/* 프로필 */}
        <Route path="/profile/*" element={<ProfileRoutes />} />
        {/* 팀보드 */}
        <Route path="/board/*" element={<BoardRoutes />} />
      </Route>
    </Routes>
  )
}
