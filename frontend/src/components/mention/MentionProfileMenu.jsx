import React from 'react'
import { Mail, Shield } from 'lucide-react'
import defaultProfile from '../../assets/images/default.png'

const MentionProfileMenu = React.forwardRef(
  ({ user, style, ...props }, ref) => {
    if (!user) return null

    return (
      <div
        ref={ref}
        style={style} // 라이브러리가 계산한 좌표 스타일 적용
        className="z-9999 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl focus:outline-none"
        {...props}
      >
        <div className="flex flex-col items-center gap-3">
          {/* 프로필 이미지 */}
          <div className="relative">
            <img
              src={user.profileImg || defaultProfile}
              alt={user.nickname}
              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md"
            />
          </div>

          {/* 닉네임 */}
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-800">{user.name}</h4>
          </div>

          <div className="h-px w-full bg-gray-200" />

          {/* 상세 정보 */}
          <div className="flex w-full flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 truncate">
              <Mail size={14} className="shrink-0 text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="shrink-0 text-gray-400" />
              <span className="capitalize">{user.position || '직책 없음'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default MentionProfileMenu
