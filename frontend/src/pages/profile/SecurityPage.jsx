import { useState } from 'react'
import FormModal from '../../components/modals/FormModal'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useUserMutations } from '../../hooks/auth/useUserMutations'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Globe,
  Key,
  Laptop,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  Trash2,
  XCircle,
} from 'lucide-react'

export default function SecurityPage() {
  // 임시 데이터 (로그인 활동 내역)
  const loginActivities = [
    {
      id: 1,
      device: 'Chrome — Windows',
      location: 'Seoul, KR',
      time: '2025/11/14 10:23',
      active: true,
      icon: <Laptop size={20} />,
    },
    {
      id: 2,
      device: 'Safari — iPhone',
      location: 'Busan, KR',
      time: '2025/11/13 22:10',
      active: false,
      icon: <Smartphone size={20} />,
    },
  ]

  // 사용자 정보 조회
  const { data: user, isLoading } = useAuthQuery()

  // 기능
  const { logout, changePassword, deactivateUser, deleteUser } =
    useUserMutations()
  const { sendEmailVerification } = useAuthMutations()

  const [isPwModalOpen, setPwModalOpen] = useState(false)

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
  const handleChangePassword = (formData) => {
    // formData: {currentPassword, newPassword, confirmPassword}
    changePassword(formData, {
      onSuccess: () => {
        setPwModalOpen(false)
      },
    })
  }

  const isVerified = user.verifyStatus === 'VERIFIED'
  const isLocal = user.provider === 'LOCAL'

  return (
    <div className="animate-fade-in mx-auto w-full max-w-4xl space-y-8 p-8 pb-20">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">보안 설정</h2>
          <p className="mt-1 text-gray-500">
            계정 보안 및 로그인 활동을 관리합니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* 1. 이메일 인증 */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Mail size={20} className="text-gray-500" />
            이메일 인증
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {user.email}
                </p>
                <p
                  className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${
                    isVerified ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {isVerified ? (
                    <>
                      <CheckCircle2 size={12} /> 인증 완료됨
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> 인증되지 않음
                    </>
                  )}
                </p>
              </div>
              {!isVerified && (
                <button
                  onClick={() => sendEmailVerification(user.email)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-blue-50 hover:ring-blue-300"
                >
                  인증 메일 발송
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              안전한 계정 사용을 위해 이메일 인증을 완료해주세요.
            </p>
          </div>
        </div>

        {/* 2. 비밀번호 변경 */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Key size={20} className="text-gray-500" />
            비밀번호
          </h3>
          <div className="justify-betwee flex items-center rounded-lg bg-gray-100 p-4">
            <div>
              <p className="text-sm font-medium text-gray-800">비밀번호 변경</p>
              <p className="mt-1 text-xs text-gray-500">
                {isLocal
                  ? '정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.'
                  : '현재 Google 계정으로 로그인 중입니다.'}
              </p>
            </div>
            {isLocal && (
              <button
                onClick={() => setPwModalOpen(true)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                변경하기
              </button>
            )}
          </div>
        </div>

        {/* 3. 소셜 계정 연동 */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Globe size={20} className="text-gray-500" />
            소셜 계정
          </h3>
          <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">
                소셜 계정 연동
              </p>
              <p className="mt-1 text-xs text-gray-500">
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

        {/* 추가) 2단계 인증 - 보류*/}

        {/* 4. 로그인 활동 - 보류 */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Smartphone size={20} className="text-gray-500" />
              로그인 활동
            </h3>
          </div>
          <div className="space-y-4">
            {loginActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400">{activity.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.device}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.location} • {activity.time}
                    </p>
                  </div>
                </div>
                {activity.active && (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    현재 활동 중
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. 위험 구역 */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-700">
            <AlertTriangle size={20} />
            위험 구역
          </h3>
          <div className="space-y-4">
            {/* 로그아웃 버튼 */}
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">모두 로그아웃</p>
                <p className="text-xs text-gray-500">
                  모든 기기에서 로그아웃합니다.
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">계정 비활성화</p>
                <p className="text-xs text-gray-500">
                  계정을 일시적으로 정지합니다. 언제든 복구할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => deactivateUser()}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
              >
                <Ban size={16} />
                비활성화
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-800">계정 영구 삭제</p>
                <p className="text-xs text-gray-500">
                  모든 데이터가 삭제되며 복구할 수 없습니다.
                </p>
              </div>
              <button
                onClick={() => deleteUser()}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-red-700"
              >
                <Trash2 size={16} />
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
              placeholder: '현재 비밀번호를 입력해주세요.',
            },
            {
              label: '새 비밀번호',
              name: 'newPassword',
              type: 'password',
              placeholder: '영문과 숫자를 포함하여 8자 이상 입력해주세요.',
            },
            {
              label: '새 비밀번호 확인',
              name: 'confirmPassword',
              type: 'password',
              placeholder: '새 비밀번호를 다시 입력해주세요.',
            },
          ]}
          onSubmit={handleChangePassword}
          onClose={() => setPwModalOpen(false)}
        />
      )}
    </div>
  )
}
