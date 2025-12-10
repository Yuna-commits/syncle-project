import { boardApi } from '../../api/board.api'

export const createBoardSlice = (set, get) => ({
  activeBoard: null,
  isLoading: false,
  error: null,
  isSettingsOpen: false, // 우측 설정 사이드바
  settingsView: 'MENU', // 사이드바 내 현재 화면
  isShareOpen: false, // 공유 모달

  // 설정 사이드바 토글 (기본)
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  // 특정 화면으로 설정 사이드바 열기
  openSettings: (viewName = 'MENU') =>
    set({ isSettingsOpen: true, settingsView: viewName }),

  // 사이드바 내부에서 화면 전환
  setSettingsView: (viewName) => set({ settingsView: viewName }),

  // 보드 공유 모달 토글
  toggleShare: () => set((state) => ({ isShareOpen: !state.isShareOpen })),

  // 보드 데이터 초기화 (페이지 나갈 때 사용)
  resetBoard: () => set({ activeBoard: null, error: null }),

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
      await boardApi.toggleFavorite(activeBoard.id)
    } catch (error) {
      // 실패 시 롤백
      set({ activeBoard: { ...activeBoard, isFavorite: previousState } })
      if (error.response?.data?.errorCode === 'FAVORITE_LIMIT_EXCEEDED') {
        alert('즐겨찾기는 최대 4개까지만 가능합니다.')
      }
    }
  },

  // 보드 상세 정보 가져오기
  fetchBoard: async (boardId, navigate, showLoading = true) => {
    set({ error: null })
    try {
      if (showLoading) {
        set({ isLoading: true })
      }
      // 1. 백엔드에서 보드 뷰(보드+멤버+리스트+카드) 데이터 조회
      // GET /api/boards/{boardId}/view
      const response = await boardApi.fetchBoard(boardId)
      const serverData = response.data.data

      console.log('응답: ', response)

      // 백엔드 데이터를 프론트엔드 구조로 변환
      const formattedData = normalizeBoardData(serverData)

      console.log('보드 데이터: ', formattedData)

      // 3. 상태 업데이트
      set({ activeBoard: formattedData })
    } catch (error) {
      if (error.response.status === 403) {
        alert('해당 보드에 접근할 권한이 없습니다')
        navigate('/dashboard') // 메인화면으로 강제 이동
      }
      console.error('보드 로드 실패:', error)
      set({ error: '보드 정보를 불러오지 못했습니다.' })
    } finally {
      set({ isLoading: false })
    }
  },

  // 보드 정보 수정 (이름, 설명, 공개범위)
  updateBoard: async (boardId, updateData) => {
    if (!updateData) {
      return
    }
    // UI 먼저 변경사항 반영
    const prevBoard = get().activeBoard
    set({ activeBoard: { ...prevBoard, ...updateData } })

    try {
      await boardApi.updateBoard(boardId, updateData)
    } catch (error) {
      console.error('보드 수정 실패:', error)
      set({ activeBoard: prevBoard }) // 롤백
      alert('보드 정보 수정에 실패했습니다.')
    }
  },

  // 보드 삭제
  deleteBoard: async (boardId) => {
    const teamId = get().teamId
    try {
      await boardApi.deleteBoard(boardId)
      window.location.href = `/teams/${teamId}/boards` // 삭제 후 이동
    } catch (error) {
      console.error('보드 삭제 실패:', error)
      alert('보드 삭제에 실패했습니다.')
    }
  },
})

// 2. 데이터 변환 (Server Array -> Client Object Map)
// 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
const normalizeBoardData = (dto) => {
  if (!dto) {
    return null
  }

  const columns = {}
  const serverLists = dto.lists || []
  const completedTasks = [] // 완료된 카드들을 모을 배열

  serverLists.forEach((list) => {
    // 이 리스트에 속한 '진행 중'인 카드들
    const activeTasks = []

    ;(list.cards || []).forEach((card) => {
      const mappedCard = {
        id: card.id,
        listId: list.id, // 부모 리스트 ID 역참조 용
        title: card.title,
        description: card.description,
        order: card.orderIndex,
        dueDate: card.dueDate,
        isComplete: card.isComplete || false,
        // 댓글 수
        commentCount: card.commentCount || 0,

        // 백엔드에서 넘어온 ChecklistVo 리스트를 바로 매핑
        checklists: (card.checklists || []).map((cl) => ({
          id: cl.id,
          title: cl.title,
          done: cl.done,
        })),

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
      }

      // 완료 여부에 따라 카드 분리
      if (mappedCard.isComplete) {
        completedTasks.push(mappedCard)
      } else {
        activeTasks.push(mappedCard)
      }
    })

    // columns에는 '진행 중'인 카드만 저장
    columns[list.id] = {
      id: list.id,
      title: list.title,
      order: list.orderIndex,
      // 카드 매핑 (CardResponse -> UI Card Object)
      tasks: activeTasks,
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

  // 기본 리스트 순서
  const columnOrder = serverLists.map((l) => l.id)

  // 완료된 카드가 하나라도 있으면 '완료' 리스트를 맨 끝에 추가
  if (completedTasks.length > 0) {
    const doneListId = 'virtual-done-list' // 가상 리스트
    columns[doneListId] = {
      id: doneListId,
      title: '완료',
      order: 9999,
      tasks: completedTasks,
      isVirtual: true,
    }
    columnOrder.push(doneListId)
  }

  // 3. 최종 보드 객체 반환
  return {
    ...dto,

    // 멤버 리스트 변환
    members: (dto.boardMembers || []).map(mapMember), // 보드 헤더 표시용
    teamMembers: (dto.teamMembers || []).map(mapMember), // 초대 모달 등 사용

    columns, // 변환된 컬럼 객체
    columnOrder: columnOrder, // 리스트 순서 배열 (필요시 사용)
  }
}
