import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useBoardStore = create((set, get) => ({
  // 현재 보고 있는 보드의 상세 데이터
  activeBoard: null,

  isLoading: false,
  error: null,

  // UI 모달, 패널 상태
  selectedCard: null, // 현재 열린 카드 객체
  selectedCardColumnId: null, // 현재 열린 카드가 속한 리스트 ID
  isSettingsOpen: false, // 우측 설정 사이드바
  isShareOpen: false, // 공유 모달
  isCardActionsOpen: false, // 카드 상세 내 액션 메뉴 드롭다운

  /**
   * === UI 제어 ===
   */

  // 카드 상세 모달 열기
  openCardModal: (card, columnId) =>
    set({
      selectedCard: card,
      selectedCardColumnId: columnId,
      isCardActionsOpen: true,
    }),

  // 카드 상세 모달 닫기
  closeCardModal: () =>
    set({
      selectedCard: null,
      selectedCardColumnId: null,
      isCardActionsOpen: false,
    }),

  // 설정 사이드바 토글
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  // 보드 공유 모달 토글
  toggleShare: () => set((state) => ({ isShareOpen: !state.isShareOpen })),

  toggleCardActions: () =>
    set((state) => ({ isCardActionsOpen: !state.isCardActionsOpen })),

  /**
   * === API 액션 ===
   */

  // 보드 상세 정보 가져오기
  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null })

    try {
      // 1. 백엔드에서 보드 뷰(보드+멤버+리스트+카드) 데이터 조회
      // GET /api/boards/{boardId}/view
      const response = await api.get(`/boards/${boardId}/view`)
      const serverData = response.data.data

      // 백엔드 데이터를 프론트엔드 구조로 변환
      const formattedData = normalizeBoardData(serverData)

      // 3. 상태 업데이트
      set({ activeBoard: formattedData })
    } catch (error) {
      console.error('보드 로드 실패:', error)
      set({ error: '보드 정보를 불러오지 못했습니다.' })
    } finally {
      set({ isLoading: false })
    }
  },

  // 보드 데이터 초기화 (페이지 나갈 때 사용)
  resetBoard: () => set({ activeBoard: null, error: null }),
}))

// 2. 데이터 변환 (Server Array -> Client Object Map)
// 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
const normalizeBoardData = (dto) => {
  const columns = {}

  if (dto.lists && Array.isArray(dto.lists)) {
    dto.lists.forEach((list) => {
      columns[list.id] = {
        id: list.id,
        title: list.title,
        order: list.orderIndex, // (백엔드에 순서 필드가 있다면)

        // 2. 카드(Card) 매핑
        tasks: list.cards
          ? list.cards.map((card) => ({
              id: card.id,
              title: card.title,
              description: card.description,
              variant: 'solid', // 프론트 전용 UI 속성

              // 필요한 추가 필드들 매핑
              assignee: card.assigneeName, // 예: 담당자 이름
              dueDate: card.dueDate,
              commentCount: card.commentCount || 0,
            }))
          : [],
      }
    })
  }

  // 최종 보드 객체 반환
  return {
    id: dto.id,
    name: dto.title, // 백엔드(title) -> 프론트(name)
    description: dto.description,
    visibility: dto.visibility,

    // 멤버 정보 매핑 (헤더 표시용)
    members: dto.boardMembers
      ? dto.boardMembers.map((m) => ({
          id: m.userId,
          name: m.nickname,
          profileImg: m.profileImg,
          role: m.role,
        }))
      : [],

    // 초대 모달에서 쓸 팀 멤버 전체 목록
    teamMembers: dto.teamMembers
      ? dto.teamMembers.map((m) => ({
          id: m.userId,
          name: m.nickname,
          email: m.email,
          role: m.role,
          profileImg: m.profileImg,
        }))
      : [],

    columns: columns, // 위에서 변환한 컬럼 객체
    archive: { cards: [] }, // 아카이브는 별도 API로 가져오거나 빈 값 초기화
  }
}

export default useBoardStore
