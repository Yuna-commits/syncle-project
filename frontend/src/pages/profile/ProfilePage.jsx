import InfoItem from '../../components/profile/InfoItem'
import StatCard from '../../components/profile/StatCard'
import { useState } from 'react'
import FormModal from '../../components/modals/FormModal'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import { useUserMutations } from '../../hooks/auth/useUserMutations'
import { authApi } from '../../api/auth.api'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileDetails from '../../components/profile/ProfileDetails'
import ProfileStats from '../../components/profile/ProfileStats'

export default function ProfilePage() {
  // 로그인 사용자 정보 조회
  const { data: user, isLoading } = useAuthQuery()

  const { updateProfile } = useUserMutations()

  const [isEditProfileOpen, setEditProfileOpen] = useState(false)

  // 중복 검사 상태
  const [checkStatus, setCheckStatus] = useState({
    nickname: { loading: false, message: '', isValid: false },
  })

  const isSocialLogin = user?.provider === 'GOOGLE'

  // 상태 업데이트 헬퍼 함수
  const updateNicknameStatus = (loading, message, isValid) => {
    setCheckStatus((prev) => ({
      ...prev,
      nickname: { loading, message, isValid },
    }))
  }

  // 닉네임 중복 확인 핸들러
  const checkNicknameDuplicate = async (nickname) => {
    if (!nickname) {
      updateNicknameStatus(false, '', false)
      return false
    }

    updateNicknameStatus(true, '', false) // 로딩 시작

    try {
      const response = await authApi.checkNickname(nickname)
      const isDuplicate = response.data.data

      const message = isDuplicate
        ? '이미 사용 중인 닉네임입니다.'
        : '사용 가능한 닉네임입니다.'

      const isValid = !isDuplicate

      updateNicknameStatus(false, message, isValid)
      return isValid
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error)
      updateNicknameStatus(false, '중복 확인 중 오류가 발생했습니다.', false)
      return false
    }
  }

  // 프로필 수정 제출 핸들러
  const handleUpdateProfile = (formData) => {
    // 닉네임이 변경되었고, 중복 확인을 통과하지 못했다면 차단 (선택 사항)
    if (formData.nickname !== user.nickname && !checkStatus.nickname.isValid) {
      alert('닉네임 중복 확인이 필요합니다.')
      return
    }

    updateProfile(formData, {
      onSuccess: () => {
        setEditProfileOpen(false)
        // checkStatus 초기화
        setCheckStatus({
          nickname: { loading: false, message: '', isValid: false },
        })
      },
    })
  }

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

  return (
    <div className="animate-fade-in pb-20">
      {/* 1. 프로필 헤더 섹션 */}
      <ProfileHeader user={user} onEdit={() => setEditProfileOpen(true)} />

      {/* 2. 상세 정보 그리드 (비율 : 1:1) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 좌측: 개인 정보 */}
        <ProfileDetails user={user} />

        {/* 우측: 활동 통계 */}
        <ProfileStats user={user} />
      </div>

      {/* 모달 */}
      {isEditProfileOpen && (
        <FormModal
          title="프로필 수정"
          fields={[
            {
              label: '닉네임',
              name: 'nickname',
              value: user.nickname,
              disabled: isSocialLogin,
              placeholder: '닉네임을 입력해주세요',
              description:
                isSocialLogin &&
                '※ 소셜 로그인 사용자는 닉네임을 변경할 수 없습니다.',
              // 닉네임 중복 확인
              onCheck: isSocialLogin
                ? null
                : (currentValue) => checkNicknameDuplicate(currentValue),
              isChecking: checkStatus.nickname.loading,
              // 성공/실패 메시지 표시
              error:
                !checkStatus.nickname.isValid && checkStatus.nickname.message,
              success:
                checkStatus.nickname.isValid && checkStatus.nickname.message,
            },
            {
              label: '자기소개',
              name: 'description',
              value: user.description || '',
              placeholder: '한 줄 소개를 입력해주세요.',
            },
            {
              label: '직책',
              name: 'position',
              value: user.position || '',
              placeholder: '자신의 직책을 입력해주세요.',
            },
          ]}
          onSubmit={handleUpdateProfile}
          onClose={() => {
            setEditProfileOpen(false)
            setCheckStatus({
              nickname: { loading: false, message: '', isValid: false },
            })
          }}
        />
      )}
    </div>
  )
}
