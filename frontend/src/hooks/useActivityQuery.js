import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../api/activity.api'
import useActivityFilterStore from '../stores/useActivityFilterStore'

// 날짜별 그룹화 함수
const groupLogsByDate = (logs) => {
  if (!logs || logs.length === 0) return []

  // 날짜(YYYY-MM-DD)를 키로 하는 객체 생성
  // ex) groups : {'2024-11-25': [log1, log2], '2024-11-24': [log3]}
  const groups = logs.reduce((acc, log) => {
    const date = log.createdAt.split('T')[0] // "2024-11-25T..." -> "2024-11-25"
    // date가 키인 배열이 없으면 새로 생성
    if (!acc[date]) {
      acc[date] = []
    }

    // date 키 배열에 현재 log를 푸시
    acc[date].push(log)
    return acc
  }, {})

  // 객체를 배열로 변환하고 날짜 내림차순 정렬
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({
      date,
      logs: groups[date],
    }))
}

export const useActivityQuery = () => {
  // 조회 필터 상태
  const { filter } = useActivityFilterStore()

  return useQuery({
    // queryKey에 filter를 포함시켜 필터 변경 시 자동 패치
    queryKey: ['activity', filter],
    queryFn: async () => {
      // 쿼리 파라미터 구성
      const params = {
        type: filter.type === 'all' ? null : filter.type,
        keyword: filter.keyword,
        startDate: filter.startDate,
        endDate: filter.endDate,
      }

      // 활동 내역 병렬 요청
      const [statsRes, topBoardsRes, logsRes] = await Promise.all([
        activityApi.getStats(),
        activityApi.getTopBoards(),
        activityApi.getLogs(params),
      ])

      console.log('활동 통계', statsRes)
      console.log('인기 보드', topBoardsRes)
      console.log('활동 로그', logsRes)

      return {
        stats: statsRes.data.data,
        topBoards: topBoardsRes.data.data,
        logs: groupLogsByDate(logsRes.data.data),
      }
    },
    keepPreviousData: true, // 필터링 중 깜빡임 방지
    staleTime: 1000 * 60 * 6, // 5분간 캐시 유지
  })
}
