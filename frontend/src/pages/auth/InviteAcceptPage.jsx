import React, { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useInvitationMutations } from '../../hooks/team/useInvitationMutations'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // React 18 StrictMode에서 두 번 실행 방지용
  const processedRef = useRef(false)

  // 1. 로그인 정보 확인 (유저 정보가 없으면 null 반환)
  const { data: user, isLoading: isAuthLoading } = useAuthQuery()

  // 초대 수락
  const { acceptInvitation } = useInvitationMutations()

  useEffect(() => {
    if (!token) {
      alert('유효하지 않은 초대 링크입니다.')
      navigate('/dashboard')
      return
    }

    // 사용자 정보 로딩 중이면 대기
    if (isAuthLoading) return

    if (!user) {
      alert(
        '로그인이 필요한 서비스입니다.\n로그인 후 다시 링크를 클릭해주세요.',
      )
      navigate('/auth/signin', {
        state: { from: location.pathname + location.search }, // 돌아올 주소 저장
      })
      return
    }

    // 로그인 상태고, 아직 처리하지 않았다면 -> 초대 수락 요청
    if (!processedRef.current) {
      processedRef.current = true
      acceptInvitation(token)
    }
  }, [token, user, isAuthLoading, navigate, acceptInvitation])

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500">
          로그인 정보를 확인 중입니다...
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <h2 className="text-xl font-bold text-gray-800">초대 수락 처리 중...</h2>
    </div>
  )
}
