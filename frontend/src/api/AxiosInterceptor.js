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
// 2. 토큰 재발급 대기열 관리 변수 (동시성 제어)
// =====================================================

let isRefreshing = false // 현재 재발급 API가 호출 중인지 확인
let refreshSubscribers = []

// 재발급 완료 후 대기 중이던 요청들을 재실행
const onRefreshed = (accessToken) => {
  refreshSubscribers.map((callback) => callback(accessToken))
  refreshSubscribers = []
}

// 재발급 진행 중에 들어온 요청들을 대기열에 추가
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// =====================================================
// 3. Axios 인스턴스 생성
// =====================================================

const api = axios.create({
  baseURL: '/api', // 모든 요청 앞에 자동으로 붙음
  headers: {
    'Content-Type': 'application/json',
  },
})

// =====================================================
// 4. 요청 인터셉터 (Request Interceptor)
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
// 5. 응답 인터셉터 (Response Interceptor)
// : 401 에러 발생 시 토큰 재발급 로직 수행
// =====================================================

/**
 * 동작 원리
 * 1. 401 감지
 *    - 백엔드에서 JwtAuthenticationFilter가 만료된 토큰을 거르고 401 Unauthorized 응답
 * 2. 인터셉터가 토큰 재발급 로직 수행
 *
 * - 대기열 처리 : 여러 API가 동시에 401을 받아도 재발급 요청은 딱 한 번, 나머지는 대기
 * - 재시도 : 재발급에 성공하면 onRefreshed를 통해 대기 중이던 모든 요청에 새 토큰을 끼워 전송
 */

api.interceptors.response.use(
  // 성공 시 반환
  (response) => {
    return response
  },
  // 에러 발생 시 처리
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // 이미 로그인 페이지에 있다면 에러 처리 중단 (새로고침 방지)
    if (window.location.pathname.startsWith('/auth/')) {
      return Promise.reject(error)
    }

    // 401 또는 403 에러이고, 아직 재시도를 안 한 요청(_retry가 없음/false)인 경우
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      // ---------------------------------------------------
      // Case A: 이미 다른 요청에 의해 재발급이 진행 중인 경우
      // ---------------------------------------------------

      if (isRefreshing) {
        // 대기열에 현재 요청 추가, Promise를 반환하여 대기시킴
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            // 새 토큰이 발급되면 헤더를 교체하고 재요청
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      // ---------------------------------------------------
      // Case B: 재발급을 처음 시도하는 경우
      // ---------------------------------------------------

      originalRequest._retry = true // 재발급 무한 루프 방지용 플래그
      isRefreshing = true // 재발급 상태로 변경

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

        // 1. 재발급 받은 토큰 갱신
        setTokens(newAccess, newRefresh)

        // 2. Axios 인스턴스 기본 헤더 갱신 (선택 사항)
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`

        // 3. 대기 중이던 다른 요청들 처리 (Queue 비우기)
        onRefreshed(newAccess)

        // 4. 현재 실패했던 요청 헤더 갱신 및 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        // 재발급 실패 시(토큰 만료/위변조) 강제 로그아웃
        clearTokens()
        window.location.href = '/auth/signin' // 로그인 페이지로 이동

        // Promise : 비동기 결과를 다루는 객체
        // Promise.reject : 강제 실패 상태 (비동기)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    // 401이 아니거나 재시도 실패 시 에러 그대로 반환
    return Promise.reject(error)
  },
)

export default api
