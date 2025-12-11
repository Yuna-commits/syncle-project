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

// 사용자 검색
export const useUserSearchQuery = (keyword) => {
  return useQuery({
    queryKey: ['users', 'search', keyword],
    queryFn: async () => {
      if (!keyword || !keyword.trim()) return []
      const response = await userApi.searchUsers(keyword)
      return response.data.data
    },
    // 키워드가 있을 때만 쿼리 실행
    enabled: !!keyword && keyword.trim().length > 0,
    staleTime: 1000 * 60, // 1분간 검색 결과 캐싱
  })
}
