import React from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // 모든 요청 앞에 자동으로 붙음
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰이 있으면 헤더에 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
