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
import BoardJoinPage from '../pages/auth/BoardJoinPage'
import GlobalSocketWrapper from '../layouts/GlobalSocketWrapper'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. 공개 라우트 (비로그인 접근 가능) */}
      <Route element={<PublicRoute />}>
        {/* 인증 */}
        <Route path="/auth/*" element={<AuthRoutes />} />
      </Route>

      {/* 2. 비공개 라우트 (로그인 필요) */}
      {/* ProtectedRoute 통과 후, GlobalSocketWrapper를 거치도록 설정 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<GlobalSocketWrapper />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* MainLayout을 사용하는 페이지 */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard/*" element={<DashboardPage />} />
            <Route path="/teams/*" element={<TeamRoutes />} />
            <Route path="/calendar/*" element={<CalendarPage />} />
            <Route path="/notifications/*" element={<NotificationPage />} />
          </Route>

          {/* ProfileLayout을 사용하는 페이지 */}
          <Route path="/profile/*" element={<ProfileRoutes />} />

          {/* 보드 상세 */}
          <Route path="/board/*" element={<BoardRoutes />} />

          {/* 독립 페이지 */}
          <Route path="board/join" element={<BoardJoinPage />} />
          <Route path="invite/accept" element={<InviteAcceptPage />} />
          <Route path="verify-email" element={<EmailVerificationPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
