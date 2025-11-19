import { useState } from 'react'
import FormModal from '../../components/modals/FormModal'

export default function SecurityPage() {
  // 임시 데이터
  const user = {
    email: 'dooly@mail.com',
    is_verified: 0,
    last_login: '2025/11/14 10:23',
    last_login_ip: '192.168.0.12',
  }

  const loginActivities = [
    { device: 'Chrome — Windows', time: '2025/11/14 10:23', active: true },
    { device: 'Safari — iPhone', time: '2025/11/13 22:10', active: false },
  ]

  const [openChangePassword, setOpenChangePassword] = useState(false)

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) p-4 pb-20 md:p-6 md:pb-24">
      <div className="rounded-2xl border border-gray-300 bg-white p-5 lg:p-6">
        <h3 className="mb-5 text-xl font-semibold text-gray-800 lg:mb-7">
          보안 설정
        </h3>

        <div className="space-y-6">
          {/* 1) 비밀번호 변경 섹션 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">
                비밀번호 변경
              </h4>

              <button
                className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-200"
                onClick={() => setOpenChangePassword(true)}
              >
                변경
              </button>
            </div>

            <p className="text-sm text-gray-600">
              정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.
            </p>
          </div>

          {/* 2) 이메일 인증 상태 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">
              이메일 인증
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">{user.email}</p>

                {user.is_verified ? (
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    인증 완료
                  </span>
                ) : (
                  <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                    미인증
                  </span>
                )}
              </div>

              {!user.is_verified && (
                <button className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-200">
                  인증 메일 재전송
                </button>
              )}
            </div>
          </div>

          {/* 3) 비밀번호 재설정 메일 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-800">
              비밀번호 재설정
            </h4>

            <p className="mb-4 text-sm text-gray-600">
              비밀번호를 분실한 경우 이메일로 재설정 링크를 보내드립니다.
            </p>

            <button className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:cursor-pointer hover:bg-gray-200">
              재설정 링크 전송
            </button>
          </div>

          {/* 4) 로그인 기록 */}
          <div className="rounded-2xl border border-gray-300 p-5 lg:p-6">
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

          {/* 5) 전체 세션 로그아웃 */}
          <div className="rounded-2xl border border-red-300 bg-red-50 p-5 lg:p-6">
            <h4 className="mb-3 text-lg font-semibold text-red-700">경고</h4>

            {/* 1) 모든 세션 로그아웃 */}
            <div className="flex items-center justify-between border-b border-red-300 px-5 py-6">
              <div>
                <h5 className="text-sm font-semibold text-gray-800">
                  모든 세션 로그아웃
                </h5>
                <p className="mt-1 text-sm text-gray-600">
                  다른 기기에서 로그인된 모든 세션을 로그아웃합니다.
                </p>
              </div>
              <button className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:cursor-pointer hover:bg-red-200">
                로그아웃
              </button>
            </div>

            {/* 2) 계정 비활성화 */}
            <div className="flex items-center justify-between border-b border-red-300 px-5 py-6">
              <div>
                <h5 className="text-sm font-semibold text-gray-800">
                  계정 비활성화
                </h5>
                <p className="mt-1 text-sm text-gray-600">
                  계정을 일시적으로 비활성화하며, 로그인 및 활동이 제한됩니다.
                </p>
              </div>
              <button className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:cursor-pointer hover:bg-red-200">
                비활성화
              </button>
            </div>

            {/* 3) 계정 삭제 */}
            <div className="flex items-center justify-between px-5 py-6">
              <div>
                <h5 className="text-sm font-semibold text-gray-800">
                  계정 삭제
                </h5>
                <p className="mt-1 text-sm text-gray-600">
                  계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:cursor-pointer hover:bg-red-700">
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {openChangePassword && (
        <FormModal
          title="비밀번호 변경"
          fields={[
            { label: '현재 비밀번호', name: 'current', type: 'password' },
            { label: '새 비밀번호', name: 'newPassword', type: 'password' },
            {
              label: '비밀번호 확인',
              name: 'confirmPassword',
              type: 'password',
            },
          ]}
          onSubmit={(values) => {
            console.log(values)
            setOpenChangePassword(false)
          }}
          onClose={() => setOpenChangePassword(false)}
        />
      )}
    </div>
  )
}
