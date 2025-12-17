import React, { useRef } from 'react'
import defaultProfile from '../../assets/images/default.png'
import { Camera, Pencil } from 'lucide-react'

function ProfileHeader({ user, onEdit, onImageChange }) {
  const fileInputRef = useRef(null)

  const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp']

  // 카메라 아이콘 클릭 시 파일 선택창 열기
  const handleCameraClick = () => {
    fileInputRef.current.click()
  }

  // 파일 선택 시 부모 컴포넌트로 전달
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 용량 체크
    const MAX_SIZE = 500 * 1024
    if (file.size > MAX_SIZE) {
      alert('파일 크기는 500KB를 넘을 수 없습니다.')
      return
    }

    // 확장자 체크
    if (!allowedExtensions.includes(file.type)) {
      alert('jpg, png, webp 이미지 파일만 업로드 가능합니다.')
      return
    }

    onImageChange(file)

    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = ''
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-300">
      <div className="p-8 sm:p-12">
        <div className="relative flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
          {/* 프로필 사진 */}
          <div className="mb-6 sm:mb-0">
            <div
              className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm"
              onClick={handleCameraClick}
            >
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
              {/* 호버 시 나타나는 카메라 아이콘 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex flex-col items-center text-white">
                  <Camera size={32} strokeWidth={1.5} />
                  <span className="mt-1 text-xs font-medium">변경</span>
                </div>
              </div>
            </div>
            {/* 파일 입력창 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
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
