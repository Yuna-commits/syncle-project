import { useQuery } from '@tanstack/react-query'
import { userApi } from '../../api/user.api'

export const useAuthQuery = () => {
  // fetchUser 대체
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await userApi.fetchMe()
      return response.data.data
    },
    staleTime: 1000 * 60 * 30, // 30분간 데이터 유지
    retry: 0, // 로그인 실패 시 재시도 하지 않음
    refetchOnWindowFocus: false,
  })
}
