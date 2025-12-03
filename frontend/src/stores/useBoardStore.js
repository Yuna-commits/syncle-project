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

  // 즐겨찾기 토글
  toggleFavorite: async () => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 낙관적 업데이트 : API 응답 기다리지 않고 UI 먼저 변경
    const previousState = activeBoard.isFavorite
    set({
      activeBoard: { ...activeBoard, isFavorite: !previousState },
    })

    try {
      // API 호출 /boards/{boardId}/favorite
      await api.post(`/boards/${activeBoard.id}/favorite`)
    } catch (error) {
      // 실패 시 롤백
      set({ activeBoard: { ...activeBoard, isFavorite: previousState } })
      if (error.response?.data?.errorCode === 'FAVORITE_LIMIT_EXCEEDED') {
        alert('즐겨찾기는 최대 4개까지만 가능합니다.')
      }
    }
  },

  // 보드 상세 정보 가져오기
  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null })

    try {
      // 1. 백엔드에서 보드 뷰(보드+멤버+리스트+카드) 데이터 조회
      // GET /api/boards/{boardId}/view
      const response = await api.get(`/boards/${boardId}/view`)
      const serverData = response.data.data

      console.log('응답: ', response)

      // 백엔드 데이터를 프론트엔드 구조로 변환
      const formattedData = normalizeBoardData(serverData)

      console.log('보드 데이터: ', formattedData)

      // 3. 상태 업데이트
      set({ activeBoard: formattedData })
    } catch (error) {
      console.error('보드 로드 실패:', error)
      set({ error: '보드 정보를 불러오지 못했습니다.' })
    } finally {
      set({ isLoading: false })
    }
  },

  // 리스트 추가
  addList: async (title) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    try {
      // 백엔드 api 호출
      const response = await api.post(`/boards/${activeBoard.id}/lists`, {
        title,
      })

      const newList = response.data
      // 프론트엔드 상태 업데이트
      const updatedColumns = {
        ...activeBoard.columns,
        [newList.id]: {
          id: newList.id,
          title: newList.title,
          order: newList.orderIndex,
          tasks: [],
        },
      }
      set({ activeBoard: { ...activeBoard, columns: updatedColumns } })
    } catch (error) {
      console.error('리스트 추가 실패:', error)
    }
  },

  // 리스트 제목 수정
  updateList: async (listId, newTitle) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 1. 프론트엔드 선 반영 (Optimistic Update) - UX 향상
    const oldColumns = { ...activeBoard.columns }
    const updatedColumns = {
      ...oldColumns,
      [listId]: {
        ...oldColumns[listId],
        title: newTitle,
      },
    }

    set({ activeBoard: { ...activeBoard, columns: updatedColumns } })

    try {
      // 2. 백엔드 API 호출
      await api.put(`/lists/${listId}`, {
        title: newTitle,
      })
    } catch (error) {
      console.error('리스트 수정 실패:', error)
      // 실패 시 롤백
      set({ activeBoard: { ...activeBoard, columns: oldColumns } })
      alert('리스트 이름 수정에 실패했습니다.')
    }
  },

  // 리스트 삭제
  deleteList: async (listId) => {
    const { activeBoard } = get()
    if (!activeBoard) return

    // 1. 사용자에게 확인 (선택 사항, 바로 삭제하려면 제거 가능)
    if (
      !window.confirm(
        '정말 이 리스트를 삭제하시겠습니까? 포함된 카드는 모두 삭제됩니다.',
      )
    ) {
      return
    }

    try {
      // 2. 백엔드 API 호출
      await api.delete(`/lists/${listId}`)

      // 3. 프론트엔드 상태 업데이트
      const newColumns = { ...activeBoard.columns }
      delete newColumns[listId] // 객체에서 해당 리스트 ID 키를 삭제

      set({
        activeBoard: {
          ...activeBoard,
          columns: newColumns,
        },
      })
    } catch (error) {
      console.error('리스트 삭제 실패:', error)
      alert('리스트 삭제 중 오류가 발생했습니다.')
    }
  },

  // 보드 데이터 초기화 (페이지 나갈 때 사용)
  resetBoard: () => set({ activeBoard: null, error: null }),
}))

// 2. 데이터 변환 (Server Array -> Client Object Map)
// 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
const normalizeBoardData = (dto) => {
  if (!dto) {
    return null
  }

  const columns = {}

  const serverLists = dto.lists || []

  serverLists.forEach((list) => {
    columns[list.id] = {
      id: list.id,
      title: list.title,
      order: list.orderIndex,

      // 카드 매핑 (CardResponse -> UI Card Object)
      tasks: (list.cards || []).map((card) => ({
        id: card.id,
        listId: list.id, // 부모 리스트 ID 역참조 용
        title: card.title,
        description: card.description,
        order: card.orderIndex,
        dueDate: card.dueDate,
        // 댓글 수
        commentCount: card.commentCount || 0,
        // 담당자 객체 (Assignee)
        assignee: card.assigneeId
          ? {
              id: card.assigneeId,
              name: card.assigneeName,
              profileImg: card.assigneeProfileImg,
            }
          : null,

        // 프론트 UI 전용 속성 (필요시)
        variant: 'solid',
      })),
    }
  })

  // 2. 멤버 매핑 (MemberResponse -> UI Member Object)
  const mapMember = (m) => ({
    id: m.userId, // ★ 중요: 백엔드(userId) -> 프론트(id)로 매핑
    name: m.nickname,
    email: m.email,
    profileImg: m.profileImg,
    role: m.role, // "OWNER", "MEMBER" 등 Enum String
    position: m.position,
  })

  // 3. 최종 보드 객체 반환
  return {
    id: dto.id,
    name: dto.title, // title -> name
    isFavorite: dto.isFavorite,
    description: dto.description,
    visibility: dto.visibility, // "PUBLIC" or "TEAM"

    // 팀 네비게이션 정보
    teamId: dto.teamId,
    teamName: dto.teamName,

    // 멤버 리스트 변환
    members: (dto.boardMembers || []).map(mapMember), // 보드 헤더 표시용
    teamMembers: (dto.teamMembers || []).map(mapMember), // 초대 모달 등 사용

    columns: columns, // 변환된 컬럼 객체
    columnOrder: serverLists.map((l) => l.id), // 리스트 순서 배열 (필요시 사용)
  }
}

export default useBoardStore
