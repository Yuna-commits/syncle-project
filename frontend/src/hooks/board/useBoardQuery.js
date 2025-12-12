import { useQuery } from '@tanstack/react-query'
import { boardApi } from '../../api/board.api'

// 1. 데이터 변환 (Server Array -> Client Object Map)
// 백엔드: List<ListWithCardsResponse> -> 프론트: columns { id: { ... } }
const normalizeBoardData = (dto) => {
  if (!dto) {
    return null
  }

  const columns = {}
  // 원본 배열 복사 후 정렬
  const serverLists = [...(dto.lists || [])].sort((a, b) => {
    // 1순위: orderIndex (순서)
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex
    }
    // 2순위: id (생성일 순 - 먼저 만든게 앞으로)
    // 9999로 orderIndex가 같을 때 뒤섞이는 것을 방지
    return a.id - b.id
  })
  const completedTasks = [] // 완료된 카드들을 모을 배열

  serverLists.forEach((list) => {
    // 이 리스트에 속한 '진행 중'인 카드들
    const activeTasks = []

    // 리스트와 동일하게 orderIndex 우선, 그 다음 id 순으로 정렬
    const sortedCards = [...(list.cards || [])].sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) {
        return a.orderIndex - b.orderIndex
      }
      return a.id - b.id
    })

    // 댓글 트리 구조 변환 헬퍼 함수
    const buildCommentTree = (flatComments) => {
      const map = {}
      const roots = []

      // ID를 키로 하는 맵 생성
      flatComments.forEach((c) => {
        map[c.id] = { ...c, replies: [] } // replies 배열 초기화
      })

      // 부모-자식 연결
      flatComments.forEach((c) => {
        // 맵에 있는 객체를 참조
        const node = map[c.id]

        if (c.parentId && map[c.parentId]) {
          // 부모가 있으면 부모의 replies에 넣음
          map[c.parentId].replies.push(node)
        } else {
          // 부모가 없으면 최상위 루트
          roots.push(node)
        }
      })

      return roots
    }

    sortedCards.forEach((card) => {
      // 서버에서 온 평면 리스트 매핑
      const flatComments = (card.comments || []).map((comment) => ({
        id: comment.id,
        content: comment.content,
        writerId: comment.writerId,
        writerName: comment.writerName,
        writerProfileImg: comment.writerProfileImg,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
      }))

      // 트리 구조로 변환
      const treeComments = buildCommentTree(flatComments)

      const mappedCard = {
        id: card.id,
        listId: list.id,
        title: card.title,
        description: card.description,
        priority: card.priority,
        order: card.orderIndex,
        startDate: card.startDate,
        dueDate: card.dueDate,
        isComplete: card.isComplete || false,
        label: card.label,
        labelColor: card.labelColor,

        // 댓글 트리
        comments: treeComments,

        // 댓글 수
        commentCount: card.commentCount || 0,

        // 백엔드에서 넘어온 ChecklistVo 리스트를 바로 매핑
        checklists: (card.checklists || [])
          .filter((cl) => cl.id)
          .map((cl) => ({
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

export const useBoardQuery = (boardId) => {
  return useQuery({
    queryKey: ['board', Number(boardId)], // 이 키가 캐시의 이름표가 됩니다.
    queryFn: async () => {
      const response = await boardApi.fetchBoard(boardId)
      console.log('📌 [RAW SERVER DATA]', response.data.data)
      return normalizeBoardData(response.data.data)
    },

    staleTime: 1000 * 60, // 1분 동안은 "신선한 데이터"로 취급 (API 재호출 안 함)
  })
}
