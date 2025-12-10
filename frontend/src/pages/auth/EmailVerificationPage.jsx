import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // URL에서 토큰 추출 (예: /auth/verify-email?token=abcdef...)
  const token = searchParams.get('token')

  // React 18 StrictMode에서 두 번 실행 방지
  const processedRef = useRef(false)

  // React Query Hook 사용
  const { verifyEmailLink } = useAuthMutations()

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    if (!token) {
      alert('유효하지 않은 인증 링크입니다.')
      navigate('/dashboard')
      return
    }

    // 인증 요청 실행
    verifyEmailLink(token)
  }, [token, navigate, verifyEmailLink])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white p-10 text-center shadow-lg">
        {/* 로딩 스피너 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">
            이메일 인증 처리 중...
          </h2>
          <p className="text-sm text-gray-500">
            잠시만 기다려주세요. 인증이 완료되면 자동으로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
