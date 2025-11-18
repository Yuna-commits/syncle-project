import InfoItem from '../../components/profile/InfoItem'
import defaultProfile from '../../assets/images/default.png'
import { useState } from 'react'
import FormModal from '../../components/profile/FormModal'

export default function ProfilePage() {
  // 임시 데이터
  const user = {
    nickname: '둘리',
    email: 'dooly@mail.com',
    description: '안녕하세요.',
    position: '공룡',
    profile_img: defaultProfile,
    is_verified: 0,
    created_at: '2025/11/14',
    updated_at: '2025/11/14',
  }
  const stats = {
    teamCount: 2,
    boardCount: 3,
    cardCount: 5,
    commentCount: 13,
    notificationCount: 999,
  }

  const [isEditProfileOpen, setEditProfileOpen] = useState(false)
  const [isEditPersonalOpen, setEditPersonalOpen] = useState(false)

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) p-4 pb-20 md:p-6 md:pb-24">
      <div className="rounded-2xl border border-gray-300 bg-white p-5 lg:p-6">
        <h3 className="mb-5 text-xl font-semibold text-gray-800 lg:mb-7">
          계정 설정
        </h3>

        <div className="space-y-6">
          {/* 사용자 프로필 섹션 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">프로필</h4>

              <button
                className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-200"
                onClick={() => setEditProfileOpen(true)}
              >
                프로필 수정
              </button>
            </div>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                {/* 프로필 이미지 */}
                <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-300">
                  <img
                    alt="사용자"
                    src={user.profile_img}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* 이름 + 자기소개 */}
                <div className="order-3 text-center xl:order-2 xl:text-left">
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">
                    {user.nickname}
                  </h4>

                  <p className="text-sm text-gray-700">
                    {user.description || ''}
                  </p>

                  {/* 이메일 인증 여부 */}
                  {user.is_verified === 1 ? (
                    <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      인증 완료
                    </span>
                  ) : (
                    <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                      미인증
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 개인 정보 섹션 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">개인 정보</h4>

              <button
                className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-200"
                onClick={() => setEditPersonalOpen(true)}
              >
                개인 정보 수정
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <InfoItem label="이메일" value={user.email} />
              <InfoItem label="직책" value={user.position || '직책 없음'} />
              <InfoItem label="가입일" value={user.created_at} />
              <InfoItem label="수정일" value={user.updated_at} />
            </div>
          </div>

          {/* 활동 정보 섹션 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <h4 className="text-lg font-semibold text-gray-800 lg:mb-6">
              활동 정보
            </h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <InfoItem label="참여 팀" value={stats.teamCount} />
              <InfoItem label="보드" value={stats.boardCount} />
              <InfoItem label="카드" value={stats.cardCount} />
              <InfoItem label="댓글" value={stats.commentCount} />
              <InfoItem label="알림" value={stats.notificationCount} />
            </div>
          </div>
        </div>
      </div>

      {/* 모달 조작 */}
      {isEditProfileOpen && (
        <FormModal
          title="프로필 수정"
          fields={[
            {
              label: '닉네임',
              name: 'nickname',
              type: 'text',
              value: user.nickname,
            },
            {
              label: '자기소개',
              name: 'description',
              type: 'text',
              value: user.description,
            },
          ]}
          onSubmit={(values) => {
            console.log(values)
            setEditProfileOpen(false)
          }}
          onClose={() => setEditProfileOpen(false)}
        />
      )}
      {isEditPersonalOpen && (
        <FormModal
          title="개인 정보 수정"
          fields={[
            {
              label: '이메일',
              name: 'email',
              type: 'email',
              value: user.email,
            },
            {
              label: '직책',
              name: 'position',
              type: 'text',
              value: user.position,
            },
          ]}
          onSubmit={(values) => {
            console.log(values)
            setEditProfileOpen(false)
          }}
          onClose={() => setEditPersonalOpen(false)}
        />
      )}
    </div>
  )
}
