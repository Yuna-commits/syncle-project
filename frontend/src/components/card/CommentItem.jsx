import { useState } from 'react'
import { useCommentMutations } from '../../hooks/card/useCommentMutations'
import defaultProfile from '../../assets/images/default.png'
import MentionRenderer from '../mention/MentionRenderer'
import MentionEditor from '../mention/MentionEditor'
import { formatRelativeTime } from '../../utils/dateUtils'
import { CornerDownRight, Edit2, Trash2 } from 'lucide-react'

export default function CommentItem({
  comment,
  cardId,
  listId,
  boardId,
  currentUser,
}) {
  const { createComment, updateComment, deleteComment } =
    useCommentMutations(boardId)

  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  console.log('--- 댓글 권한 확인 ---')
  console.log('내 정보(currentUser):', currentUser)
  console.log('내 ID:', currentUser?.id, typeof currentUser?.id)
  console.log('댓글 작성자 ID:', comment.writerId, typeof comment.writerId)
  console.log('-----------------------')
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

  const isWriterLeft = comment.isWriterLeft

  return (
    <div className="flex gap-3">
      {/* 프로필 이미지 */}
      <img
        src={comment.writerProfileImg || defaultProfile}
        alt={comment.writerName}
        className={`mt-1 h-8 w-8 rounded-full object-cover ${
          // 탈퇴 시 흑백/투명도 처리
          isWriterLeft ? 'bg-gray-200 opacity-70 grayscale' : 'bg-gray-100'
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="group">
          {/* 헤더 */}
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  isWriterLeft ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                {comment.writerName}
              </span>

              {/* 탈퇴 표시 텍스트 추가 */}
              {isWriterLeft && (
                <span className="text-xs text-red-400">(탈퇴)</span>
              )}

              <span className="text-xs text-gray-400">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {/* 수정/삭제 버튼 (내 글일 때만) */}
            {!isEditing && isMyComment && (
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:cursor-pointer hover:text-blue-600"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:cursor-pointer hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* 본문 영역 (수정 모드 vs 보기 모드) */}
          {isEditing ? (
            <MentionEditor
              initialValue={comment.content}
              onSubmit={onUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="수정"
              minHeight={44}
              autoFocus={true}
            />
          ) : (
            <div>
              <div
                onClick={() => setIsReplying(!isReplying)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm whitespace-pre-wrap text-gray-700 transition-colors hover:bg-gray-100"
              >
                <MentionRenderer content={comment.content} />
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
            <MentionEditor
              placeholder="답글을 입력하세요..."
              onSubmit={onReply}
              onCancel={() => setIsReplying(false)}
              submitLabel="등록"
              minHeight={44}
              autoFocus={true}
            />
          </div>
        )}

        {/* 대댓글 리스트 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-4">
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
