import React, { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/AxiosInterceptor'

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // React 18 StrictMode에서 두 번 실행 방지용
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    if (!token) {
      alert('유효하지 않은 초대 링크입니다.')
      navigate('/dashboard')
      return
    }

    const acceptInvite = async () => {
      try {
        // 초대 수락 API 호출
        await api.post(`/invitations/accept`, null, {
          params: { token },
        })
        alert('초대가 성공적으로 수락되었습니다.')
        window.location.href = '/dashboard'
      } catch (error) {
        console.error('초대 수락 실패:', error)
        const msg =
          error.response?.data?.message || '초대 수락 중 오류가 발생했습니다.'
        alert(msg)
        navigate('/dashboard')
      }
    }

    acceptInvite()
  }, [token, navigate])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="mt-4 font-medium text-gray-600">
        초대 수락 처리 중입니다...
      </p>
    </div>
  )
}
