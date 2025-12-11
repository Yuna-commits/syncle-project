import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../api/user.api'
import { authApi } from '../../api/auth.api'
import { useNavigate } from 'react-router-dom'

export const useUserMutations = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 이메일 인증 여부 확인
  const checkIsVerified = () => {
    // 캐시된 유저 데이터 가져오기
    const user = queryClient.getQueryData(['user', 'me'])

    if (user && user.verifyStatus !== 'VERIFIED') {
      if (
        window.confirm(
          '이메일 인증이 완료된 계정만 사용할 수 있는 기능입니다.\n보안 설정 페이지로 이동하시겠습니까?',
        )
      ) {
        navigate('/profile/security')
      }
      return false
    }
    return true
  }

  // --- 사용자 정보 관리 ---

  // 로그아웃 (내부 정의)
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      localStorage.clear()
      sessionStorage.clear()
      queryClient.setQueryData(['user', 'me'], null)
      alert('로그아웃 되었습니다.')
      navigate('/auth/signin')
    },
  })

  // 프로필 수정
  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      // 쿼리 무효화를 통해 최신 데이터를 서버에서 다시 가져옴 -> 수정된 모든 정보 즉시 반영
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      alert('프로필이 수정되었습니다.')
    },
    onError: (err) => alert(err.response?.data?.message || '프로필 수정 실패'),
  })

  // 비밀번호 변경 (로그인 상태)
  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      logoutMutation.mutate()
    },
    onError: (err) =>
      alert(err.response?.data?.message || '비밀번호 변경 실패'),
  })

  // 계정 비활성화
  const deactivateUserMutation = useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () => {
      alert('계정이 비활성화되었습니다.')
      logoutMutation.mutate()
    },
    onError: () => alert('비활성화 실패'),
  })

  // 계정 삭제
  const deleteUserMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      alert('계정이 영구 삭제되었습니다.')
      logoutMutation.mutate()
    },
    onError: () => alert('계정 삭제 실패'),
  })

  return {
    logout: logoutMutation.mutate,
    updateProfile: (data, options) =>
      checkIsVerified() && updateProfileMutation.mutate(data, options),
    changePassword: (data) =>
      checkIsVerified() && changePasswordMutation.mutate(data),
    deactivateUser: () => checkIsVerified() && deactivateUserMutation.mutate(),
    deleteUser: () => checkIsVerified() && deleteUserMutation.mutate(),
  }
}
