import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { activityApi } from '../api/activity.api'
import useActivityFilterStore from '../stores/useActivityFilterStore'

// 날짜별 그룹화 함수
const groupLogsByDate = (logs) => {
  if (!Array.isArray(logs) || logs.length === 0) return []

  // 날짜(YYYY-MM-DD)를 키로 하는 객체 생성
  // ex) groups : {'2024-11-25': [log1, log2], '2024-11-24': [log3]}
  const groups = logs.reduce((acc, log) => {
    // createdAt 유효성 검사
    if (!log.createdAt) {
      console.warn('날짜 정보가 없는 로그가 있습니다:', log)
      return acc // 날짜 없으면 스킵
    }

    try {
      // 2. 날짜 파싱 (문자열인지 확인)
      const dateStr = String(log.createdAt) // 강제 문자열 변환
      const date = dateStr.split('T')[0]

      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(log)
    } catch (e) {
      console.error('날짜 파싱 실패:', log, e)
    }
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

// 통계, 인기 보드 조회 훅 (로그 제외)
export const useActivityStats = () => {
  return useQuery({
    queryKey: ['activity', 'stats'],
    queryFn: async () => {
      const [statsRes, topBoardsRes] = await Promise.all([
        activityApi.getStats(),
        activityApi.getTopBoards(),
      ])
      return {
        stats: statsRes.data.data,
        topBoards: topBoardsRes.data.data,
      }
    },
    staleTime: 1000 * 60 * 6, // 5분간 캐시 유지
  })
}

// 활동 로그 무한 스크롤 훅(더보기 버튼)
export const useInfiniteActivityLogs = () => {
  // 조회 필터 상태
  const { filter } = useActivityFilterStore()

  return useInfiniteQuery({
    // queryKey에 filter를 포함시켜 필터 변경 시 자동 패치
    queryKey: ['activity', 'logs', filter],
    queryFn: async ({ pageParam = 0 }) => {
      const typeParam = filter.type === 'ALL' ? null : filter.type

      // 쿼리 파라미터 구성
      const params = {
        type: typeParam,
        keyword: filter.keyword,
        startDate: filter.startDate,
        endDate: filter.endDate,
        page: pageParam, // 페이지 번호
        size: 20, // 한 번에 가져올 개수
      }

      // 활동 내역 요청
      const res = await activityApi.getMyLogs(params)
      console.log('API Response:', res.data.data)
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      // 마지막 페이지가 아니면 다음 페이지 번호 반환
      return lastPage.last ? undefined : lastPage.number + 1
    },
    // 날짜별로 그룹화, 반환
    select: (data) => {
      const allLogs = data.pages.flatMap((page) => {
        if (!page || !Array.isArray(page.content)) return []
        return page.content
      })
      return groupLogsByDate(allLogs)
    },
    keepPreviousData: true, // 필터링 중 깜빡임 방지
  })
}

// 보드 활동 로그 무한 스크롤 훅 (커서 기반)
export const useInfiniteBoardLogs = (boardId) => {
  return useInfiniteQuery({
    // 1. Query Key: 보드 ID 기준
    queryKey: ['board', 'logs', boardId],

    // 2. Query Function: pageParam이 곧 cursorId가 됨
    queryFn: async ({ pageParam = null }) => {
      const res = await activityApi.getBoardActivities(boardId, pageParam, 20)
      return res.data.data // 실제 로그 리스트 반환
    },

    // 3. Next Page Logic (커서 결정)
    getNextPageParam: (lastPage) => {
      // 마지막 페이지가 없거나 빈 배열이면 더 이상 없음
      if (!lastPage || lastPage.length === 0) return undefined

      // 가져온 개수가 요청 개수(20)보다 적으면 끝난 것임
      if (lastPage.length < 20) return undefined

      // 다음 커서는 '마지막 아이템의 ID'
      return lastPage[lastPage.length - 1].id
    },

    // 4. 데이터 가공 (그룹화)
    select: (data) => {
      // Page 객체가 아니라 List이므로 page 자체가 내용물임
      const allLogs = data.pages.flatMap((page) => page)
      return groupLogsByDate(allLogs)
    },

    enabled: !!boardId, // boardId가 있을 때만 실행
  })
}
