import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function PublicRoute() {
  // 로컬/세션 스토리지에서 토큰 확인
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

  const isAuthenticated = !!token

  // 이미 로그인한 사람이 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
