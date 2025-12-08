import { useEffect, useState } from 'react'
import FormModal from '../../components/modals/FormModal'
import useUserStore from '../../stores/useUserStore'

export default function SecurityPage() {
  // 임시 데이터 (삭제 | api 추가 필요)
  const loginActivities = [
    { device: 'Chrome — Windows', time: '2025/11/14 10:23', active: true },
    { device: 'Safari — iPhone', time: '2025/11/13 22:10', active: false },
  ]

  const {
    user,
    isLoading,
    fetchUser,
    changePassword,
    deactivateUser,
    deleteUser,
    logout,
    resendVerificationEmail,
  } = useUserStore()

  const [isPwModalOpen, setPwModalOpen] = useState(false)

  // 마운트될 때마다 프로필 정보 가져오기
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 정보 조회 성공 여부 표시
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

  // 핸들러
  const handleChangePassword = async (values) => {
    // values: {currentPassword, newPassword, confirmPassword}
    const success = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })

    if (success) setPwModalOpen(false)
  }

  const handleDeactivate = async () => {
    if (
      window.confirm('정말 계정을 비활성화하시겠습니까?\n로그인이 제한됩니다.')
    )
      await deactivateUser()
  }

  const handleDelete = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'))
      await deleteUser()
  }

  const handleResendEmail = async () => {
    await resendVerificationEmail()
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl p-4 pb-20 md:p-6 md:pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">보안 설정</h2>
        <p className="mt-2 text-gray-500">비밀번호와 계정 보안을 관리하세요.</p>
      </div>

      <div className="space-y-6">
        {/* 1) 기본 보안 (비밀번호 & 이메일) */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            로그인 및 보안
          </h3>

          <div className="divide-y divide-gray-200">
            {/* 비밀번호 변경 - 소셜 로그인 사용자는 사용 x */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-800">비밀번호</p>
                <p className="text-sm text-gray-500">
                  {user.provider === 'LOCAL'
                    ? '정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.'
                    : '현재 Google 계정으로 로그인 중입니다.'}
                </p>
              </div>
              {user.provider === 'LOCAL' ? (
                <button
                  onClick={() => setPwModalOpen(true)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
                >
                  변경
                </button>
              ) : (
                ''
              )}
            </div>

            {/* 이메일 인증 */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-800">이메일 인증</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  {user.verifyStatus === 'VERIFIED' ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      인증됨
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      미인증
                    </span>
                  )}
                </div>
              </div>
              {user.verifyStatus !== 'VERIFIED' && (
                <button
                  onClick={handleResendEmail}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
                >
                  인증 메일 재전송
                </button>
              )}
            </div>

            {/* 소셜 계정 연동 상태 */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-800">소셜 계정 연동</p>
                <p className="text-sm text-gray-500">
                  {user.provider === 'GOOGLE'
                    ? '구글 계정으로 로그인 중입니다.'
                    : '연동된 소셜 계정이 없습니다.'}
                </p>
              </div>
              {user.provider === 'GOOGLE' && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                  Google 연동됨
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 추가) 2단계 인증 - 보류*/}

        {/* 추가) 로그인 기록 - 보류 */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
          <h4 className="mb-4 text-lg font-semibold text-gray-800">
            로그인 활동
          </h4>

          <div className="space-y-4">
            {loginActivities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-none"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {act.device}
                  </p>
                  <p className="text-xs text-gray-500">{act.time}</p>
                </div>

                {act.active ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    현재 세션
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                    로그아웃됨
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3) 위험 구역 */}
        <div className="rounded-3xl border border-red-300 bg-red-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            위험 구역
          </h3>

          <div className="space-y-4">
            {/* 로그아웃 */}
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">
                  모든 기기에서 로그아웃
                </p>
                <p className="text-xs text-gray-500">
                  현재 접속 중인 기기를 포함해 모두 로그아웃됩니다.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm('모든 기기에서 로그아웃 하시겠습니까?')) {
                    await logout()
                  }
                }}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-200"
              >
                로그아웃
              </button>
            </div>

            {/* 비활성화 */}
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">계정 비활성화</p>
                <p className="text-xs text-gray-500">
                  계정을 일시적으로 정지합니다. 언제든 복구할 수 있습니다.
                </p>
              </div>
              <button
                onClick={handleDeactivate}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-200"
              >
                비활성화
              </button>
            </div>

            {/* 계정 삭제 */}
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">계정 영구 삭제</p>
                <p className="text-xs text-gray-500">
                  모든 데이터가 삭제되며 복구할 수 없습니다.
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-red-800"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {isPwModalOpen && (
        <FormModal
          title="비밀번호 변경"
          fields={[
            {
              label: '현재 비밀번호',
              name: 'currentPassword',
              type: 'password',
            },
            { label: '새 비밀번호', name: 'newPassword', type: 'password' },
            {
              label: '새 비밀번호 확인',
              name: 'confirmPassword',
              type: 'password',
            },
          ]}
          onSubmit={handleChangePassword}
          onClose={() => setPwModalOpen(false)}
        />
      )}
    </div>
  )
}
