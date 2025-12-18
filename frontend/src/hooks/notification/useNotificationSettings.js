import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// 기본 설정값 (서버 데이터가 없을 때 사용)
const DEFAULT_SETTINGS = {
  dnd: false, // 방해 금지 모드
  push: {
    mentions: true,
    assignments: true,
    cardMoves: false, // 카드 이동은 시끄러우니 기본 OFF
    dueDates: true,
  },
  email: {
    invites: true,
    mentions: true,
    assignments: true,
    updates: false,
  },
}

export const useNotificationSettings = () => {
  const queryClient = useQueryClient()

  // 1. 설정 조회
  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      /**
       * TODO) 백엔드 api 구현 필요
       */
      // 임시: 로컬 스토리지 사용 (백엔드 구현 전까지)
      const saved = localStorage.getItem('notification_settings')
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
    },
    staleTime: Infinity, // 설정은 자주 안 바뀜
  })

  // 2. 설정 수정
  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newSettings) => {
      /**
       * TODO) 백엔드 api 구현 필요
       */
      // 임시: 로컬 스토리지 저장
      localStorage.setItem('notification_settings', JSON.stringify(newSettings))
      return newSettings
    },
    onSuccess: (newSettings) => {
      // 이 훅을 쓰는 모든 컴포넌트 갱신
      queryClient.setQueryData(['notificationSettings'], newSettings)
    },
  })

  return { settings, updateSettings, isLoading }
}
