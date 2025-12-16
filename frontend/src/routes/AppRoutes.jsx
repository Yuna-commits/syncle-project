import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthRoutes from './AuthRoutes'
import ProfileRoutes from './ProfileRoutes'
import MainLayout from '../layouts/MainLayout'
import BoardRoutes from './BoardRoutes'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import TeamRoutes from './TeamRoutes'
import InviteAcceptPage from '../pages/auth/InviteAcceptPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import NotificationPage from '../pages/user/NotificationPage'
import CalendarPage from '../pages/user/CalendarPage'
import EmailVerificationPage from '../pages/auth/EmailVerificationPage'

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

      {/* 2. Common Routes (로그인 여부 상관없이 접근 가능) */}
      <Route path="/auth/invite/accept" element={<InviteAcceptPage />} />
      <Route path="/auth/verify-email" element={<EmailVerificationPage />} />

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
          {/* 위에서 매칭되지 않은 모든 경로는 여기로 떨어집니다. */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          {/* 팀 관련 라우트 */}
          <Route path="/teams/*" element={<TeamRoutes />} />
        </Route>
        {/* 프로필 */}
        <Route path="/profile/*" element={<ProfileRoutes />} />
        {/* 팀보드 */}
        <Route path="/board/*" element={<BoardRoutes />} />
        {/* 팀 초대 */}
        <Route path="/invite/accept" element={<InviteAcceptPage />} />
      </Route>
    </Routes>
  )
}
