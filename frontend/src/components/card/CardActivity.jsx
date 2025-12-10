import React, { useState } from 'react'
import { MessageSquare, Edit2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import useBoardStore from '../../stores/useBoardStore'
import useUserStore from '../../stores/useUserStore'
import { useCommentMutations } from '../../hooks/useCommentMutations'
import defaultProfile from '../../assets/images/default.png'
import { useParams } from 'react-router-dom'
import { useBoardQuery } from '../../hooks/useBoardQuery'

function CardActivity() {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { user: currentUser } = useUserStore()

  // API 훅 (boardId 필수)
  const { createComment } = useCommentMutations(activeBoard?.id)

  const [commentText, setCommentText] = useState('')

  // 방어 코드
  if (!selectedCard) return null

  const comments = selectedCard.comments || []
  const cardId = selectedCard.id
  const listId = selectedCard.listId // ★ 중요: 낙관적 업데이트용

  // 댓글 등록
  const handleAddComment = () => {
    if (!commentText.trim()) return

    createComment(
      { cardId, listId, content: commentText },
      {
        onSuccess: () => setCommentText(''), // 입력창 초기화
      },
    )
  }

  // 엔터키 입력 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  return (
    <section>
      {/* 1. 헤더 (개수 표시 제거됨) */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">활동(댓글)</h3>
        </div>
      </div>

      <div className="space-y-6 pl-8">
        {/* 2. 입력창 (Comment Input) */}
        <div className="flex gap-3">
          {/* 내 프로필 이미지 */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <img
              src={currentUser?.profileImg || defaultProfile}
              alt="Me"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative flex-1">
            <textarea
              className="min-h-[50px] w-full resize-none overflow-hidden rounded-xl border border-gray-200 bg-white p-3 pr-16 text-sm shadow-sm transition-shadow outline-none hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="댓글을 작성하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={commentText ? 3 : 1}
            />
            {commentText && (
              <button
                onClick={handleAddComment}
                className="absolute right-3 bottom-3 rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-700"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* 3. 댓글 목록 (Comments List) */}
        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                cardId={cardId}
                listId={listId}
                boardId={activeBoard?.id}
                isMyComment={currentUser?.id === comment.writerId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// 개별 댓글 아이템 (수정/삭제 기능 포함)
// ----------------------------------------------------------------------
const CommentItem = ({ comment, cardId, listId, boardId, isMyComment }) => {
  const { updateComment, deleteComment } = useCommentMutations(boardId)

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)

  const handleUpdate = () => {
    if (editText.trim() !== comment.content) {
      updateComment({
        cardId,
        listId,
        commentId: comment.id,
        updates: { content: editText },
      })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteComment({ cardId, listId, commentId: comment.id })
    }
  }

  // 날짜 포맷팅 (낙관적 업데이트 시 createdAt이 없을 수 있음)
  const dateStr = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: ko,
      })
    : '방금 전'

  return (
    <div className="group flex gap-3">
      {/* 작성자 프사 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
        <img
          src={comment.writerProfileImg || defaultProfile}
          alt={comment.writerName}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1">
        {/* 헤더: 이름 + 시간 */}
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-sm font-bold text-gray-900">
            {comment.writerName}
          </span>
          <span className="text-xs text-gray-400">{dateStr}</span>
        </div>

        {/* 내용 or 수정 모드 */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                수정 완료
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditText(comment.content)
                }}
                className="text-xs text-gray-500 hover:underline"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 본문 표시 (whitespace-pre-wrap: 줄바꿈 허용) */}
            <div className="rounded-lg border border-transparent bg-white p-2 text-sm whitespace-pre-wrap text-gray-700 transition-all group-hover:border-gray-100 group-hover:shadow-sm">
              {comment.content}
            </div>

            {/* 수정/삭제 버튼 (내 글일 때 + hover 시 노출) */}
            {isMyComment && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600"
                  title="수정"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600"
                  title="삭제"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardActivity
