import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useParams } from 'react-router-dom'
import useBoardStore from '../../stores/useBoardStore'
import defaultProfile from '../../assets/images/default.png'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCommentMutations } from '../../hooks/card/useCommentMutations'
import { useAuthQuery } from '../../hooks/auth/useAuthQuery'
import CommentItem from './CommentItem'
import MentionEditor from '../mention/MentionEditor'
import useBoardPermission from '../../hooks/board/useBoardPermission'

function CardActivity() {
  const { boardId } = useParams()
  // 캐싱 데이터 활용
  const { data: activeBoard } = useBoardQuery(Number(boardId))

  const { selectedCard } = useBoardStore()
  const { data: currentUser } = useAuthQuery()
  const { canEdit } = useBoardPermission(activeBoard)

  // activeBoard가 로딩되기 전 방어
  const { createComment } = useCommentMutations(activeBoard?.id)

  if (!selectedCard || !activeBoard) return null

  const comments = selectedCard.comments || []
  const { id: cardId, listId } = selectedCard

  // 메인 댓글 등록 핸들러
  const handleCreateComment = (text) => {
    createComment({ cardId, listId, content: text })
  }

  return (
    <section>
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">댓글</h3>
        </div>
      </div>

      <div className="space-y-6 pl-8">
        {/* 메인 입력창 */}
        {canEdit && (
          <div className="flex gap-3">
            <img
              src={currentUser?.profileImg || defaultProfile}
              alt="Me"
              className="h-8 w-8 rounded-full bg-gray-100 object-cover"
            />
            <MentionEditor
              onSubmit={handleCreateComment}
              placeholder="댓글을 입력해주세요... (@멘션)"
              submitLabel="저장"
              minHeight={44} // 댓글창 높이
            />
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              cardId={cardId}
              listId={listId}
              boardId={activeBoard.id}
              currentUser={currentUser}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CardActivity
