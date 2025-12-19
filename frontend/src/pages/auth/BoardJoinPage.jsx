import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useMutation } from '@tanstack/react-query'
import { invitationApi } from '../../api/invitation.api'

export default function BoardJoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  console.log(token)
  // React 18 StrictMode 및 중복 실행 방지용
  const processedRef = useRef(false)

  // 1. 로그인 정보 확인 (유저 정보가 없으면 null 반환)
  const { data: user, isLoading: isAuthLoading } = useAuthQuery()

  // 2. 보드 참여 Mutation
  const joinMutation = useMutation({
    mutationFn: (tokenValue) => invitationApi.acceptBoardInvitation(tokenValue),
    onSuccess: (response) => {
      // 서버에서 전달한 boardId 추출 (구조에 따라 response.data 또는 response.data.data)
      const boardId = response.data.data
      alert('보드 멤버로 참여되었습니다.')
      navigate(`/board/${boardId}`, { replace: true })
    },
    onError: (error) => {
      console.error('참여 실패:', error)
      alert(
        error.response?.data?.message ||
          '유효하지 않거나 만료된 초대 링크입니다.',
      )
      navigate('/dashboard', { replace: true })
    },
  })

  useEffect(() => {
    if (!token) {
      alert('유효하지 않은 초대 링크입니다.')
      navigate('/dashboard')
      return
    }

    // 로그인 정보 로딩 중이면 대기
    if (isAuthLoading) return

    // 비로그인 상태면 로그인 페이지로 유도
    if (!user) {
      alert(
        '로그인이 필요한 서비스입니다.\n로그인 후 다시 링크를 클릭해주세요.',
      )
      navigate('/auth/signin', {
        state: { from: window.location.pathname + window.location.search },
      })
      return
    }

    // 로그인 상태고 아직 처리 전이라면 실행
    if (!processedRef.current) {
      processedRef.current = true

      joinMutation.mutate(token)
    }
  }, [token, user, isAuthLoading, joinMutation, navigate])

  // 로딩 상태 UI
  if (isAuthLoading || joinMutation.isPending) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500">
          {isAuthLoading
            ? '로그인 정보를 확인 중입니다...'
            : '보드 참여 처리 중입니다...'}
        </p>
      </div>
    )
  }

  return null // 처리 완료 후 navigate 되므로 빈 화면 유지
}
