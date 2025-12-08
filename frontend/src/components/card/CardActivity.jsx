import { MessageSquare } from 'lucide-react'
import { useState } from 'react'

function CardActivity() {
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: Date.now(),
      user: 'Me',
      text: commentText,
      createdAt: new Date().toISOString(),
    }

    setComments([...comments, newComment])
    setCommentText('')
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">Activity</h3>
        </div>
      </div>
      <div className="space-y-6 pl-8">
        {/* Comment Input */}
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            ME
          </div>
          <div className="relative flex-1">
            <textarea
              className="min-h-[50px] w-full resize-none overflow-hidden rounded-xl border border-gray-200 p-3 pr-16 text-sm shadow-sm transition-shadow outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="댓글을 작성하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
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
        {/* Comments List */}
        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {comment.user[0]}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {comment.user}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="rounded-lg border border-transparent bg-white p-2 text-sm text-gray-700 transition-all group-hover:border-gray-100 group-hover:shadow-sm">
                    {comment.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CardActivity
