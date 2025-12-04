import React, { useState, useEffect } from 'react'
import useBoardStore from '../../stores/useBoardStore'
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
  Plus,
  Calendar,
} from 'lucide-react'

export default function CardDetailModal() {
  const {
    activeBoard,
    selectedCard,
    selectedCardColumnId,
    closeCardModal,
    moveCard,
    // TODO: 실제 API가 구현되면 아래 함수들을 스토어에서 가져와 연결하세요.
    // updateCardDescription,
    // addComment,
    // deleteCard
  } = useBoardStore()

  // --- Local State ---
  const [description, setDescription] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [commentText, setCommentText] = useState('')

  // [추가] 완료(체크) 버튼 상태 및 애니메이션 상태
  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 데모용 가짜 데이터 (댓글)
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Manager',
      text: '디자인 시안 확인 부탁드립니다.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ])

  // 데모용 가짜 데이터 (체크리스트)
  const [checklists, setChecklists] = useState([
    {
      id: 1,
      title: '진행 사항',
      items: [
        { id: 1, text: '요구사항 분석', done: true },
        { id: 2, text: '화면 설계', done: false },
      ],
    },
  ])
  const [checklistInput, setChecklistInput] = useState('')

  // 모달이 열릴 때 데이터 동기화
  useEffect(() => {
    if (selectedCard) {
      setDescription(selectedCard.description || '')
      // TODO: 실제 데이터에 'isComplete' 필드가 있다면 여기서 초기화하세요.
      // setIsComplete(selectedCard.isComplete || false)
    }
  }, [selectedCard])

  // 예외 처리
  if (!selectedCard || !activeBoard) return null

  const currentColumn = activeBoard.columns[selectedCardColumnId]
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns)
    : []

  // --- Handlers ---

  // 설명 저장 (UI만 반영)
  const handleSaveDescription = () => {
    setIsEditingDesc(false)
    // TODO: updateCardDescription(selectedCard.id, description) 호출
  }

  // 댓글 추가
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

  // 체크리스트 아이템 토글
  const toggleCheckItem = (listId, itemId) => {
    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item,
          ),
        }
      }),
    )
  }

  // 체크리스트 아이템 추가
  const handleAddCheckItem = (e, listId) => {
    e.preventDefault()
    if (!checklistInput.trim()) return

    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list
        return {
          ...list,
          items: [
            ...list.items,
            { id: Date.now(), text: checklistInput, done: false },
          ],
        }
      }),
    )
    setChecklistInput('')
  }

  // 카드 이동 핸들러
  const handleMoveCard = (e) => {
    const newColId = Number(e.target.value) || e.target.value
    if (newColId && newColId !== selectedCardColumnId) {
      const targetColumn = activeBoard.columns[newColId]
      const newIndex = targetColumn.tasks ? targetColumn.tasks.length : 0
      moveCard(selectedCard.id, selectedCardColumnId, newColId, newIndex)
    }
  }

  // [추가] 완료 버튼 토글 핸들러 (애니메이션 효과 포함)
  const toggleComplete = () => {
    setIsComplete((prev) => !prev)
    setIsAnimating(true) // 애니메이션 시작

    // 300ms 뒤에 애니메이션 상태 초기화 (CSS transition 시간과 맞춤)
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // 진행률 계산
  const calculateProgress = (items) => {
    if (!items || items.length === 0) return 0
    const doneCount = items.filter((i) => i.done).length
    return Math.round((doneCount / items.length) * 100)
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          {/* 제목과 버튼을 감싸는 컨테이너: items-start로 설정하여 아이콘이 항상 위쪽에 위치 */}
          <div className="flex w-full gap-4 pr-10">
            {/* [수정] 완료 체크 버튼 
               1. mt-1 제거하여 위쪽 정렬 맞춤
               2. h-9 w-9 (36px)로 조정하여 text-xl(약 28px+행간) 제목과 시각적 높이 균형 맞춤
            */}
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
              {' '}
              {/* pt-0.5를 주어 텍스트를 미세하게 중앙 조정 */}
              <h2
                className={`mb-1 text-xl leading-tight font-bold text-gray-900 transition-all duration-300 ${
                  isComplete ? 'text-gray-400 line-through' : ''
                }`}
              >
                {selectedCard.title}
              </h2>
              {/* COMPLETED 텍스트 제거됨 */}
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

        {/* --- Body (Scrollable) --- */}
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
                        placeholder="상세 설명을 입력하세요..."
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

              {/* Checklist */}
              {checklists.map((list) => {
                const progress = calculateProgress(list.items)
                return (
                  <section key={list.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckSquare size={20} className="text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-800">
                          {list.title}
                        </h3>
                      </div>
                      <button className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200">
                        Hide checked items
                      </button>
                    </div>

                    <div className="pl-8">
                      {/* Progress Bar */}
                      <div className="mb-4 flex items-center gap-3">
                        <span className="w-8 text-right text-xs font-bold text-gray-500">
                          {progress}%
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-3 space-y-2">
                        {list.items.map((item) => (
                          <label
                            key={item.id}
                            className="group flex cursor-pointer items-center gap-3 rounded p-1 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => toggleCheckItem(list.id, item.id)}
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`text-sm transition-colors ${item.done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'}`}
                            >
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Add Item Input */}
                      <form onSubmit={(e) => handleAddCheckItem(e, list.id)}>
                        <input
                          className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm transition-all outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                          placeholder="항목 추가..."
                          value={checklistInput}
                          onChange={(e) => setChecklistInput(e.target.value)}
                        />
                      </form>
                    </div>
                  </section>
                )
              })}

              {/* Activity / Comments */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-800">
                      Activity
                    </h3>
                  </div>
                  <button className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200">
                    Show details
                  </button>
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

                  {/* Comment List */}
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
                </div>
              </section>
            </div>

            {/* [Right Column] Sidebar Actions */}
            <div className="w-full shrink-0 space-y-6 md:w-60">
              {/* Meta Info */}
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

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Actions
                </h4>

                {/* Move Card Select */}
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-500">
                    <ArrowRight size={14} />
                  </div>
                  <select
                    className="w-full cursor-pointer appearance-none rounded-md bg-gray-100 py-1.5 pr-2 pl-8 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={selectedCardColumnId}
                    onChange={handleMoveCard}
                  >
                    {allColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        Move to: {col.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Archive Button */}
                <button className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                  <span>Archive</span>
                </button>

                {/* More Button */}
                <button className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  <MoreHorizontal size={14} />
                  <span>More</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
