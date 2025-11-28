import React from 'react'
import axios from 'axios'

// =====================================================
// 1. 토큰 관리 헬퍼 함수
// =====================================================

const getAccessToken = () => {
  return (
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  )
}

const getRefreshToken = () => {
  return (
    localStorage.getItem('refreshToken') ||
    sessionStorage.getItem('refreshToken')
  )
}

// 토큰 갱신 (원래 있던 저장소 위치를 기억해서 갱신)
const setTokens = (accessToken, refreshToken) => {
  if (localStorage.getItem('refreshToken')) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  } else {
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
  }
}

// 로그아웃 (모든 저장소 비우기)
const clearTokens = () => {
  localStorage.clear()
  sessionStorage.clear()
}

// =====================================================
// 2. Axios 인스턴스 생성
// =====================================================

const api = axios.create({
  baseURL: '/api', // 모든 요청 앞에 자동으로 붙음
  headers: {
    'Content-Type': 'application/json',
  },
})

// =====================================================
// 3. 요청 인터셉터 (Request Interceptor)
// : 요청을 보내기 전에 헤더에 토큰 자동 추가
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// =====================================================
// 4. 응답 인터셉터 (Response Interceptor)
// : 401 에러 발생 시 토큰 재발급 로직 수행
// =====================================================

api.interceptors.response.use(
  // 성공 시 반환
  (response) => {
    return response
  },
  // 에러 발생 시 처리
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고, 아직 재시도를 안 한 요청(_retry가 없음/false)인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // 재발급 무한 루프 방지용 플래그

      try {
        const refreshToken = getRefreshToken()

        // 프론트에 Refresh Token 자체가 없는 경우 -> 로그아웃
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // 재발급 API 호출
        const { data } = await axios.post('/api/auth/token/refresh', {
          token: refreshToken,
        })

        const { accessToken: newAccess, refreshToken: newRefresh } = data.data

        // 재발급 받은 토큰 갱신
        setTokens(newAccess, newRefresh)

        // 원래 요청의 헤더를 갱신된 토큰으로 교체
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`

        // 원래 요청 재시도
        return api(originalRequest)
      } catch (refreshError) {
        // 재발급 실패 시(토큰 만료/위변조) 강제 로그아웃
        clearTokens()
        window.location.href = '/auth/signin' // 로그인 페이지로 이동

        // Promise : 비동기 결과를 다루는 객체
        // Promise.reject : 강제 실패 상태 (비동기)
        return Promise.reject(refreshError)
      }
    }
    // 401이 아니거나 재시도 실패 시 에러 그대로 반환
    return Promise.reject(error)
  },
)

export default api
