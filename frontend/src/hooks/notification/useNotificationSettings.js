import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../api/notification.api'

// 기본 설정값 (서버 데이터가 없을 때 사용)
const DEFAULT_SETTINGS = {
  dnd: false,
  email: {
    invites: true,
    mentions: true,
    assignments: true,
    updates: false,
  },
  push: {
    mentions: true,
    comments: true,
    assignments: true,
    dueDates: true,
    cardUpdates: true,
    cardMoves: false,
  },
}

export const useNotificationSettings = () => {
  const queryClient = useQueryClient()

  // 1. 설정 조회 (GET /api/notifications/settings)
  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const res = await notificationApi.getMySettings()
      return res.data.data || DEFAULT_SETTINGS
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  })

  // 2. 설정 수정 (PUT /api/notifications/settings)
  const { mutate: updateSettings } = useMutation({
    mutationFn: (newSettings) => notificationApi.updateMySettings(newSettings),

    // 낙관적 업데이트: UI 먼저 변경
    onMutate: async (newSettings) => {
      // 진행 중인 조회 요청 취소
      await queryClient.cancelQueries({ queryKey: ['notificationSettings'] })

      // 이전 값 저장 (에러 시 롤백용)
      const prev = queryClient.getQueryData(['notificationSettings'])

      // 새 값으로 캐시 즉시 업데이트
      queryClient.setQueryData(['notificationSettings'], newSettings)

      return { prev }
    },

    // 에러 발생 시 롤백
    onError: (err, newSettings, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['notificationSettings'], context.prev)
        console.error('설정 저장 실패: ', err)
      }
    },

    // 성공/실패 여부 상관없이 최신 데이터 다시 조회
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
    },
  })

  return { settings, updateSettings, isLoading }
}
