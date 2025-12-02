import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  // 로컬/세션 스토리지에서 토큰 확인
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

  // !! : boolean 값으로 변환(이중 부정으로 isAuthenticated == T)
  const isAuthenticated = !!token

  // 이전 위치 정보 가져오기
  const location = useLocation()

  // 로그인 상태면 자식 라우트 렌더링, 비로그인 상태면 로그인 페이지 리다이렉트
  // replace: 뒤로가기 눌렀을 때 원래 페이지로 돌아오지 않게 함
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/signin" replace state={{ from: location }} />
  )
}
