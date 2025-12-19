import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

export default function ProtectedRoute() {
  // 로컬/세션 스토리지에서 토큰 확인
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

  // 이전 위치 정보 가져오기
  const location = useLocation()
  let isAuthenticated = false

  console.log('🛡️ [ProtectedRoute] 토큰 진입')

  // 토큰이 존재할 때 검증 수행
  if (token) {
    try {
      // 토큰 디코딩
      const decoded = jwtDecode(token)
      // 현재 시간 구하기 (ms -> s 변환)
      const currentTime = Date.now() / 1000

      // 만료 시간 비교 (exp > 현재 시간일 때 유효)
      if (decoded.exp > currentTime) {
        isAuthenticated = true
      } else {
        console.warn('❌ [ProtectedRoute] 토큰 만료됨! 삭제 실행')
        // 만료된 경우 스토리지 비우기
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error('❌ [ProtectedRoute] 토큰 해석 실패! 삭제 실행', error)
      // 토큰 형식이 올바르지 않은 경우
      isAuthenticated = false

      // 잘못된 토큰 삭제
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
    }
  } else {
    console.log('❌ [ProtectedRoute] 토큰 아예 없음')
  }

  // 로그인 상태면 자식 라우트 렌더링, 비로그인 상태면 로그인 페이지 리다이렉트
  // replace: 뒤로가기 눌렀을 때 원래 페이지로 돌아오지 않게 함
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/signin" replace state={{ from: location }} />
  )
}
