import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../api/AxiosInterceptor'
import defaultProfile from '../../assets/images/default.png'

export default function TeamInvitationsPage() {
  const { teamId } = useParams()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  // 초대 내역 조회
  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/invitations/teams/${teamId}`)
      setInvitations(response.data.data)
    } catch (error) {
      console.error('초대 내역 조회 실패', error)
      // 권한 없음 등의 에러 처리 가능
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    if (teamId) fetchInvitations()
  }, [teamId, fetchInvitations])

  // 초대 취소 (API 호출 예시)
  const handleCancel = async (invitationId) => {
    if (!window.confirm('초대를 취소하시겠습니까?')) return
    await api.delete(`/invitations/${invitationId}`)
    // 취소 후 목록 새로고침
    fetchInvitations()
  }

  // 상태 뱃지
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            <Clock size={12} /> 대기 중
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle size={12} /> 수락됨
          </span>
        )
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            <XCircle size={12} /> 거절됨
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
            <AlertCircle size={12} /> 만료됨
          </span>
        )
      default:
        return status
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl">
        <h3 className="mb-6 text-2xl font-bold text-gray-900">초대 관리</h3>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  초대받은 사람
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  초대일
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invitations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    보낸 초대 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={invitation.inviteeProfile_img || defaultProfile}
                          alt={invitation.inviteeName}
                          className="h-9 w-9 rounded-full bg-gray-200 object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {invitation.inviteeName || '이름 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invitation.inviteeEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invitation.status)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleCancel(invitation.id)}
                        className="text-red-600 hover:text-red-900 hover:underline"
                      >
                        취소
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
