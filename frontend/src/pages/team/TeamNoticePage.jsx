import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useTeamNoticesQuery,
  useMyTeamInfoQuery,
} from '../../hooks/team/useTeamQuery'
import { useDeleteTeamNotice } from '../../hooks/team/useTeamMutations'
import NoticeWriteModal from '../../components/team/NoticeWriteModal'
import { formatDate } from '../../utils/dateUtils'
import defaultProfile from '../../assets/images/default.png'

import {
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  Eye,
  Clock,
  ClipboardList,
} from 'lucide-react'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'

const TeamNoticePage = () => {
  const { teamId } = useParams()

  // 내 정보(로그인 유저) 가져오기
  const { data: userInfo } = useAuthQuery()
  const myUserId = userInfo?.id

  // 1. React Query Hooks
  const { data: notices, isLoading, isError } = useTeamNoticesQuery(teamId)
  const { mutate: deleteNotice, isPending: isDeleting } =
    useDeleteTeamNotice(teamId)

  // 2. 권한 및 상태 관리
  const { role } = useMyTeamInfoQuery(teamId, myUserId)
  const isOwner = role === 'OWNER'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState(null)

  // 3. 핸들러
  const handleDelete = (noticeId, e) => {
    e.stopPropagation() // 부모 클릭 이벤트 전파 방지
    if (window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      deleteNotice(noticeId)
    }
  }

  const handleEdit = (notice, e) => {
    if (e) e.stopPropagation()
    setSelectedNotice(notice)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedNotice(null)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        공지사항을 불러오는데 실패했습니다.
      </div>
    )

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* 페이지 헤더 */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              {/* 아이콘 크기 조정 및 정렬 */}
              <Megaphone className="h-7 w-7 text-blue-500" />팀 공지사항
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              팀원들에게 중요한 소식을 전하세요.
            </p>
          </div>

          {isOwner && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-blue-700 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              공지 작성
            </button>
          )}
        </div>

        {/* 공지사항 목록 */}
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
          {notices && notices.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="group p-5 transition-colors duration-150 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* 내용 영역 (클릭 시 수정 모달 혹은 상세) */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleEdit(notice)}
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        {/* 왼쪽: 중요 태그 + 제목 */}
                        <div className="flex items-center gap-2 overflow-hidden">
                          {notice.isImportant && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                              <Megaphone className="h-3 w-3" />
                              필독
                            </span>
                          )}
                          <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                            {notice.title}
                          </h3>
                        </div>

                        {/* 오른쪽: 메타 정보 (여기로 이동됨) */}
                        <div className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={notice.writerProfileImg || defaultProfile}
                              alt={notice.writerNickname}
                              className="h-5 w-5 rounded-full border border-gray-300 object-cover"
                            />
                            <span className="hidden font-medium text-gray-600 sm:inline">
                              {notice.writerNickname}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(notice.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{notice.viewCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* 본문 내용 */}
                      <p className="mt-1.5 ml-1 line-clamp-2 border-l-4 border-gray-300 py-1 pl-4 text-sm leading-relaxed text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800">
                        {notice.content}
                      </p>
                    </div>

                    {/* 관리 버튼 (팀장만 노출) */}
                    {isOwner && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleEdit(notice, e)}
                          className="rounded p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(notice.id, e)}
                          disabled={isDeleting}
                          className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // 빈 상태 (Empty State)
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <ClipboardList className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                등록된 공지사항이 없습니다
              </h3>
              <p className="mt-1 max-w-sm text-gray-500">
                팀원들에게 전달할 새로운 소식이 있다면 첫 번째 공지사항을
                작성해보세요.
              </p>
              {isOwner && (
                <button
                  onClick={handleCreate}
                  className="mt-6 flex items-center gap-2 rounded bg-blue-50 px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4" />
                  지금 작성하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 작성/수정 모달 */}
      {isModalOpen && (
        <NoticeWriteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamId={teamId}
          noticeToEdit={selectedNotice}
          isOwner={isOwner}
        />
      )}
    </main>
  )
}

export default TeamNoticePage
