import React from 'react'
import InfoItem from './InfoItem'
import { Briefcase, Calendar, Clock, Mail } from 'lucide-react'

function ProfileDetails({ user }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
          내 정보
        </h3>

        <div className="flex flex-col gap-3">
          <InfoItem
            label="이메일"
            value={user.email}
            icon={<Mail size={20} />}
          />
          <InfoItem
            label="직책"
            value={user.position || '직책 없음'}
            icon={<Briefcase size={20} />}
          />
          <InfoItem
            label="가입일"
            value={formatDate(user.createdAt)}
            icon={<Calendar size={20} />}
          />
          <InfoItem
            label="마지막 수정일"
            value={formatDate(user.updatedAt)}
            icon={<Clock size={20} />}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileDetails
