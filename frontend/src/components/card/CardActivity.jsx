import React from 'react'
import { MessageSquare, Edit2, Trash2, CornerDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useBoardStore from '../../stores/useBoardStore'
import useUserStore from '../../stores/useUserStore'
import defaultProfile from '../../assets/images/default.png'
import CommentForm from './CommentForm'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCommentMutations } from '../../hooks/card/useCommentMutations'

function CardActivity() {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { user: currentUser } = useUserStore()

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
        <div className="flex gap-3">
          <img
            src={currentUser?.profileImg || defaultProfile}
            alt="Me"
            className="h-8 w-8 rounded-full bg-gray-100 object-cover"
          />
          {/* 재사용 폼 사용 */}
          <CommentForm onSubmit={handleCreateComment} submitLabel="저장" />
        </div>

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

// ----------------------------------------------------------------------
// 개별 댓글 아이템 (CommentItem)
// ----------------------------------------------------------------------
const CommentItem = ({ comment, cardId, listId, boardId, currentUser }) => {
  const { createComment, updateComment, deleteComment } =
    useCommentMutations(boardId)

  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const isMyComment = currentUser?.id === comment.writerId

  // 수정 (Update)
  const onUpdate = (text) => {
    if (text !== comment.content) {
      updateComment({
        cardId,
        listId,
        commentId: comment.id,
        updates: { content: text },
      })
    }
    setIsEditing(false)
  }

  // 답글 (Create Reply)
  const onReply = (text) => {
    createComment(
      { cardId, listId, content: text, parentId: comment.id }, // parentId 추가
      { onSuccess: () => setIsReplying(false) },
    )
  }

  // 삭제 (Delete)
  const onDelete = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      deleteComment({ cardId, listId, commentId: comment.id })
    }
  }

  const dateStr = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: ko,
      })
    : '방금 전'

  return (
    <div className="flex gap-3">
      {/* 프로필 이미지 */}
      <img
        src={comment.writerProfileImg || defaultProfile}
        alt={comment.writerName}
        className="mt-1 h-8 w-8 rounded-full bg-gray-100 object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="group">
          {/* 헤더 */}
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {comment.writerName}
              </span>
              <span className="text-xs text-gray-400">{dateStr}</span>
            </div>

            {/* 수정/삭제 버튼 (내 글일 때만) */}
            {!isEditing && isMyComment && (
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* 본문 영역 (수정 모드 vs 보기 모드) */}
          {isEditing ? (
            <CommentForm
              initialValue={comment.content}
              onSubmit={onUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="수정"
            />
          ) : (
            <div>
              <div
                onClick={() => setIsReplying(!isReplying)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm whitespace-pre-wrap text-gray-700 transition-colors hover:bg-gray-100"
              >
                {comment.content}
              </div>
            </div>
          )}
        </div>
        {/* 답글 입력창 */}
        {isReplying && (
          <div className="mt-3 flex gap-2 pl-2">
            <div className="pt-2 text-gray-300">
              <CornerDownRight size={16} />
            </div>
            <CommentForm
              placeholder="답글을 입력하세요..."
              onSubmit={onReply}
              onCancel={() => setIsReplying(false)}
              submitLabel="등록"
            />
          </div>
        )}

        {/* 대댓글 리스트 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 border-l-2 border-gray-100 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                cardId={cardId}
                listId={listId}
                boardId={boardId}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardActivity
