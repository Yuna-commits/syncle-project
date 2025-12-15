import { useParams } from 'react-router-dom'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useMemo } from 'react'
import MentionItem from './MentionItem'

function MentionRenderer({ content }) {
  const { boardId } = useParams()
  // 보드 멤버 정보 조회
  const { data: activeBoard } = useBoardQuery(Number(boardId))

  // 전체 멤버 리스트 합치기 (팀 멤버 + 보드 멤버 중복 제거)
  const allMembers = useMemo(() => {
    if (!activeBoard) return []

    const members = activeBoard.members || []
    const teamMembers = activeBoard.teamMembers || []

    // ID 기준으로 중복 제거하며 합치기
    const map = new Map()
    members.forEach((m) => map.set(m.id, m))
    teamMembers.forEach((m) => map.set(m.id, m))

    return Array.from(map.values())
  }, [activeBoard])

  if (!content) return null

  // 정규식: @ 뒤에 공백이 아닌 문자가 1개 이상 오는 패턴
  // ()를 사용해서 split 시 구분자도 배열에 포함되도록
  const regex = /(@\S+)/g
  const parts = content.split(regex)

  return (
    <span className="leading-relaxed whitespace-pre-wrap text-gray-600">
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          // 멘션된 부분 하이라이팅
          return (
            <MentionItem key={index} nickname={part} members={allMembers} />
          )
        }
        // 일반 텍스트
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

export default MentionRenderer
