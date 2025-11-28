import InfoItem from '../../components/profile/InfoItem'
import StatCard from '../../components/profile/StatCard'
import defaultProfile from '../../assets/images/default.png'
import { useEffect, useState } from 'react'
import FormModal from '../../components/modals/FormModal'
import useUserStore from '../../stores/useUserStore'

export default function ProfilePage() {
  const { user, isLoading, fetchUserProfile, updateUserProfile } =
    useUserStore()
  const [isEditProfileOpen, setEditProfileOpen] = useState(false)

  // 마운트될 때마다 프로필 정보 가져오기
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  if (isLoading && !user) {
    return (
      <div className="flex h-full w-full items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-2xl text-gray-500">
        사용자 정보를 불러올 수 없습니다.
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditProfile = async (values) => {
    const success = await updateUserProfile(values)
    if (success) setEditProfileOpen(false)
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* 1. 프로필 헤더 섹션 */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-300">
        <div className="p-8 sm:p-12">
          <div className="relative flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
            {/* 프로필 사진 */}
            <div className="mb-6 sm:mb-0">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                <img
                  src={user.profileImg || defaultProfile}
                  alt={user.nickname}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.target.src = defaultProfile)}
                />
              </div>
            </div>
            {/* 이름 및 소개 */}
            <div className="flex-1 text-center sm:ml-8 sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  {user.nickname}
                </h2>
                {user.verifyStatus === 'VERIFIED' ? (
                  <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    인증 완료
                  </span>
                ) : (
                  <span className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    미인증
                  </span>
                )}
              </div>
              <p className="mt-3 text-base text-gray-500">
                {user.description || '한 줄 소개를 입력해주세요.'}
              </p>
            </div>
            {/* 수정 버튼 */}
            <div className="mt-6 sm:mt-0">
              <button
                onClick={() => setEditProfileOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 transition-colors ring-inset hover:cursor-pointer hover:bg-gray-50"
              >
                프로필 수정
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 상세 정보 그리드 (비율 : 1:1) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {' '}
        {/* 좌측: 개인 정보 */}
        <div className="flex h-full flex-col">
          <div className="h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
              내 정보
            </h3>

            <div className="flex flex-col gap-3">
              <InfoItem
                label="이메일"
                value={user.email}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                }
              />
              <InfoItem
                label="직책"
                value={user.position || '직책 없음'}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z"
                      clipRule="evenodd"
                    />
                    <path d="M3 15.055v.689c0 1.126.958 2.164 2.338 2.532 1.444.385 3.014.616 4.662.689v-2.959c-2.499-.119-4.847-.595-6.932-1.156-.048.074-.068.164-.068.205zm14 0c0-.041-.02-.131-.068-.205-2.085.56-4.433 1.037-6.932 1.156v2.959c1.648-.073 3.218-.304 4.662-.689 1.38-.368 2.338-1.406 2.338-2.532v-.689z" />
                  </svg>
                }
              />
              <InfoItem
                label="가입일"
                value={formatDate(user.createdAt)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
              <InfoItem
                label="마지막 수정일"
                value={formatDate(user.updatedAt)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75l4 4a.75.75 0 101.06-1.06l-3.25-3.25V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
        {/* 우측: 활동 통계 */}
        <div className="flex h-full flex-col">
          <div className="h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
              활동 요약
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard
                label="참여 팀"
                value={user.activity?.participatedTeams || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="보드"
                value={user.activity?.participatedBoards || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                    />
                  </svg>
                }
              />
              <StatCard
                label="작성 카드"
                value={user.activity?.createdCards || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.425a4.5 4.5 0 01-1.413 1.041l-4.218.879a.75.75 0 01-.921-.921l.879-4.218a4.5 4.5 0 011.042-1.413L16.863 4.487zm0 0L19.5 7.125"
                    />
                  </svg>
                }
              />
              <StatCard
                label="댓글"
                value={user.activity?.createdComments || 0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="알림"
                value={0}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isEditProfileOpen && (
        <FormModal
          title="프로필 수정"
          fields={[
            { label: '닉네임', name: 'nickname', value: user.nickname },
            {
              label: '자기소개',
              name: 'description',
              value: user.description || '',
            },
            { label: '직책', name: 'position', value: user.position || '' },
          ]}
          onSubmit={handleEditProfile}
          onClose={() => setEditProfileOpen(false)}
        />
      )}
    </div>
  )
}
