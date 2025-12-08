import React, { useState, useEffect, useRef } from 'react'
import useBoardStore from '../../../stores/useBoardStore'
import {
  X,
  Check,
  AlignLeft,
  CheckSquare,
  MessageSquare,
  User,
  Tag,
  Clock,
  ArrowRight,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'

export default function CardDetailModal() {
  const {
    activeBoard,
    selectedCard,
    closeCardModal,
    moveCard,
    updateCard,
    // [수정] 변경된 액션명 사용
    createChecklist,
    updateChecklist,
    deleteChecklist,
  } = useBoardStore()

  // --- Local State ---
  const [description, setDescription] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [commentText, setCommentText] = useState('')

  // 체크리스트 토글 및 입력
  const [showChecklist, setShowChecklist] = useState(false)
  const [checklistInput, setChecklistInput] = useState('')
  const checklistInputRef = useRef(null)

  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [comments, setComments] = useState([])

  // 초기화 로직
  useEffect(() => {
    if (selectedCard) {
      setDescription(selectedCard.description || '')

      // 체크리스트 아이템이 있으면 자동 펼침
      const hasItems =
        selectedCard.checklists && selectedCard.checklists.length > 0
      setShowChecklist(hasItems)
    }
  }, [selectedCard?.id])

  if (!selectedCard || !activeBoard) return null

  // [수정] 스토어 데이터 사용
  const checklistItems = selectedCard.checklists || []
  const currentListId = selectedCard.listId
  const currentColumn = activeBoard.columns[currentListId]
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns)
    : []

  // --- Handlers ---

  const handleSaveDescription = () => {
    setIsEditingDesc(false)
    updateCard(selectedCard.id, currentListId, { description })
  }

  const handleToggleChecklist = () => {
    setShowChecklist((prev) => !prev)
    if (!showChecklist) {
      setTimeout(() => checklistInputRef.current?.focus(), 100)
    }
  }

  // [수정] 아이템 추가
  const handleAddChecklist = (e) => {
    e.preventDefault()
    if (!checklistInput.trim()) return

    createChecklist(selectedCard.id, currentListId, checklistInput)
    setChecklistInput('')
  }

  // [수정] 아이템 완료 토글 (done 필드 사용)
  const toggleCheckItem = (itemId, currentDone) => {
    updateChecklist(selectedCard.id, currentListId, itemId, {
      done: !currentDone, // [변경] isChecked -> done
    })
  }

  // [수정] 아이템 삭제
  const handleDeleteItem = (itemId) => {
    if (window.confirm('삭제하시겠습니까?')) {
      deleteChecklist(selectedCard.id, currentListId, itemId)
    }
  }

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

  const handleMoveCard = (e) => {
    const newColId = Number(e.target.value) || e.target.value
    if (newColId && newColId !== currentListId) {
      const targetColumn = activeBoard.columns[newColId]
      const newIndex = targetColumn.tasks ? targetColumn.tasks.length : 0
      moveCard(selectedCard.id, currentListId, newColId, newIndex)
    }
  }

  const toggleComplete = () => {
    setIsComplete((prev) => !prev)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

  // [수정] 진행률 계산 (done 필드 사용)
  const calculateProgress = (items) => {
    if (!items || items.length === 0) return 0
    const doneCount = items.filter((i) => i.done).length // [변경] i.done 확인
    return Math.round((doneCount / items.length) * 100)
  }
  const progress = calculateProgress(checklistItems)

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div className="flex w-full gap-4 pr-10">
            <button
              onClick={toggleComplete}
              className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isComplete
                  ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                  : 'border-gray-300 bg-transparent text-transparent hover:border-gray-400 hover:bg-gray-50'
              } ${isAnimating ? 'scale-125' : 'scale-100'} `}
              title={isComplete ? '완료 취소' : '완료 표시'}
            >
              <Check
                size={18}
                strokeWidth={3}
                className={`transition-all duration-300 ${
                  isComplete ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              />
            </button>

            <div className="w-full pt-0.5">
              <h2
                className={`mb-1 text-xl leading-tight font-bold text-gray-900 transition-all duration-300 ${
                  isComplete ? 'text-gray-400 line-through' : ''
                }`}
              >
                {selectedCard.title}
              </h2>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4">
                  {currentColumn?.title}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={closeCardModal}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
          <div className="flex flex-col gap-10 md:flex-row">
            {/* [Left Column] Main Content */}
            <div className="flex-1 space-y-8">
              {/* Description */}
              <section>
                <div className="mb-3 flex items-center gap-3">
                  <AlignLeft size={20} className="text-gray-600" />
                  <h3 className="text-base font-semibold text-gray-800">
                    Description
                  </h3>
                </div>
                <div className="pl-8">
                  {isEditingDesc ? (
                    <div className="space-y-2">
                      <textarea
                        className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-700 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveDescription}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditingDesc(false)}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingDesc(true)}
                      className={`min-h-20 cursor-pointer rounded-xl p-4 transition-colors ${
                        description
                          ? 'bg-transparent hover:bg-gray-50'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {description ||
                          '이 카드에 대한 상세 설명을 추가하려면 클릭하세요...'}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Checklist Section */}
              {showChecklist && (
                <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckSquare size={20} className="text-gray-600" />
                      <h3 className="text-base font-semibold text-gray-800">
                        체크리스트
                      </h3>
                    </div>
                    {checklistItems.length > 0 && (
                      <span className="text-xs font-medium text-gray-500">
                        {Math.round(
                          (checklistItems.filter((i) => i.done).length / // [변경] i.done
                            checklistItems.length) *
                            100,
                        )}
                        % 완료
                      </span>
                    )}
                  </div>

                  <div className="pl-8">
                    {/* Progress Bar */}
                    <div className="mb-4 h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Items List */}
                    <div className="mb-3 space-y-2">
                      {checklistItems.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center gap-3 rounded p-1 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={item.done} // [변경] item.done
                            onChange={
                              () => toggleCheckItem(item.id, item.done) // [변경] item.done
                            }
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`flex-1 text-sm transition-colors ${
                              item.done // [변경] item.done
                                ? 'text-gray-400 line-through'
                                : 'text-gray-700'
                            }`}
                          >
                            {item.title}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="invisible text-gray-400 group-hover:visible hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Input */}
                    <form onSubmit={handleAddChecklist}>
                      <input
                        ref={checklistInputRef}
                        className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm transition-all outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                        placeholder="항목 추가..."
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                      />
                    </form>
                  </div>
                </section>
              )}

              {/* Activity Section */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-800">
                      Activity
                    </h3>
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
                                {new Date(comment.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' },
                                )}
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
            </div>

            {/* [Right Column] Sidebar Actions */}
            <div className="w-full shrink-0 space-y-6 md:w-60">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Properties
                  </h4>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-500">Assignee</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-gray-500">Labels</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-500">Dates</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Add to card
                </h4>
                <button
                  onClick={handleToggleChecklist}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    showChecklist
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckSquare size={14} />
                  <span>Checklist</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Actions
                </h4>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-500">
                    <ArrowRight size={14} />
                  </div>
                  <select
                    className="w-full cursor-pointer appearance-none rounded-md bg-gray-100 py-1.5 pr-2 pl-8 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={currentListId}
                    onChange={handleMoveCard}
                  >
                    {allColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        Move to: {col.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
