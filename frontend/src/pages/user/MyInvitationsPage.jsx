import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invitationApi } from '../api/invitation.api'

export default function MyInvitationsPage() {
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 내가 받은 초대 목록 조회
  const fetchMyInvitations = async () => {
    setIsLoading(true)
    try {
      const response = await invitationApi.getMyInvitations()
      setInvitations(response.data.data)
    } catch (error) {
      console.error('초대 목록 조회 실패:', error)
      alert('초대 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 초대 수락
  const handleAccept = async (token) => {
    try {
      await invitationApi.acceptInvitation(token)
      alert('팀 초대를 수락했습니다!')
      fetchMyInvitations() // 목록 새로고침
    } catch (error) {
      console.error('초대 수락 실패:', error)
      alert(error.response?.data?.message || '초대 수락에 실패했습니다.')
    }
  }

  // 초대 거절
  const handleReject = async (token) => {
    if (!confirm('정말 이 초대를 거절하시겠습니까?')) return

    try {
      await invitationApi.rejectInvitation(token)
      alert('초대를 거절했습니다.')
      fetchMyInvitations() // 목록 새로고침
    } catch (error) {
      console.error('초대 거절 실패:', error)
      alert(error.response?.data?.message || '초대 거절에 실패했습니다.')
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  useEffect(() => {
    fetchMyInvitations()
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">받은 초대</h1>
        <p className="mt-1 text-sm text-gray-500">
          팀으로부터 받은 초대를 확인하고 수락하거나 거절할 수 있습니다.
        </p>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="py-12 text-center text-gray-500">
          불러오는 중...
        </div>
      )}

      {/* 초대 없음 */}
      {!isLoading && invitations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-3 text-gray-600">받은 초대가 없습니다.</p>
        </div>
      )}

      {/* 초대 목록 */}
      {!isLoading && invitations.length > 0 && (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                {/* 좌측: 초대 정보 */}
                <div className="flex-1">
                  {/* 팀 정보 */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.teamName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(invitation.createdAt)}
                    </p>
                  </div>

                  {/* 초대한 사람 */}
                  <div className="flex items-center gap-3">
                    {invitation.inviterProfile_img ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={invitation.inviterProfile_img}
                        alt=""
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {invitation.inviterName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invitation.inviterName}님이 초대했습니다
                      </p>
                      <p className="text-xs text-gray-500">
                        {invitation.inviterEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 우측: 액션 버튼 */}
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleAccept(invitation.token)}
                    className="whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => handleReject(invitation.token)}
                    className="whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
