import React from 'react'
import defaultProfile from '../../assets/images/default.png'
import { Pencil } from 'lucide-react'

function ProfileHeader({ user, onEdit }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-300">
      <div className="p-8 sm:p-12">
        <div className="relative flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
          {/* 프로필 사진 */}
          <div className="mb-6 sm:mb-0">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
              {user.profileImg ? (
                <img
                  src={user.profileImg}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={defaultProfile}
                  alt="Default Profile"
                  className="h-full w-full object-cover opacity-50"
                />
              )}
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
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-300 transition-colors ring-inset hover:cursor-pointer hover:bg-gray-50"
            >
              <Pencil size={18} /> 프로필 수정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
