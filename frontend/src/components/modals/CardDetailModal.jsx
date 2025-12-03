import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'

export default function CardDetailModal() {
  const {
    selectedCard,
    closeCardModal,
    cardComments,
    addComment,
    cardChecklists,
    addChecklist,
    addChecklistItem,
    toggleChecklistItem,
    updateCardDescription,
    moveCardFromModal,
    archiveCard,
    selectedCardColumnId,
    boards,
    activeBoardId,
  } = useBoardStore()

  const [commentText, setCommentText] = useState('')
  const [checklistText, setChecklistText] = useState('')

  if (!selectedCard) return null

  // 현재 보드의 컬럼 정보 가져오기 (이동용)
  const columns = Object.values(boards[activeBoardId].columns)
  const currentColumn = boards[activeBoardId].columns[selectedCardColumnId]

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(commentText)
      setCommentText('')
    }
  }

  const handleChecklistSubmit = (e) => {
    e.preventDefault()
    if (checklistText.trim()) {
      addChecklistItem(checklistText)
      setChecklistText('')
    }
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-gray-50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between border-b bg-white p-6">
          <div>
            <h2 className="text-xl font-bold">{selectedCard.title}</h2>
            <p className="text-sm text-gray-500">
              in list <span className="underline">{currentColumn?.title}</span>
            </p>
          </div>
          <button
            onClick={closeCardModal}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Main Content */}
            <div className="space-y-8 md:col-span-3">
              {/* Description */}
              <section>
                <h3 className="mb-2 font-bold text-gray-700">설명</h3>
                <textarea
                  className="min-h-[100px] w-full rounded border bg-white p-3"
                  value={selectedCard.description}
                  onChange={(e) => updateCardDescription(e.target.value)}
                  placeholder="상세 설명을 입력하세요..."
                />
              </section>

              {/* Checklists */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700">체크리스트</h3>
                  {(cardChecklists[selectedCard.id] || []).length === 0 && (
                    <button
                      onClick={addChecklist}
                      className="rounded bg-gray-200 px-2 py-1 text-xs"
                    >
                      생성
                    </button>
                  )}
                </div>
                {(cardChecklists[selectedCard.id] || []).map((cl) => (
                  <div key={cl.id} className="mb-2 rounded border bg-white p-3">
                    <ul className="space-y-2">
                      {cl.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklistItem(cl.id, item.id)}
                          />
                          <span
                            className={
                              item.done ? 'text-gray-400 line-through' : ''
                            }
                          >
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <form
                      onSubmit={handleChecklistSubmit}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        value={checklistText}
                        onChange={(e) => setChecklistText(e.target.value)}
                        placeholder="할 일 추가..."
                        className="flex-1 rounded border p-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded bg-blue-500 px-2 text-xs text-white"
                      >
                        추가
                      </button>
                    </form>
                  </div>
                ))}
              </section>

              {/* Comments */}
              <section>
                <h3 className="mb-2 font-bold text-gray-700">댓글</h3>
                <div className="mb-3 space-y-3">
                  {(cardComments[selectedCard.id] || []).map((c) => (
                    <div
                      key={c.id}
                      className="rounded border bg-white p-3 text-sm"
                    >
                      <p>{c.text}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded border p-2 text-sm"
                    placeholder="댓글을 작성하세요..."
                  />
                  <button
                    type="submit"
                    className="mt-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
                  >
                    저장
                  </button>
                </form>
              </section>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-2 md:col-span-1">
              <div className="text-xs font-bold text-gray-500 uppercase">
                Actions
              </div>
              <select
                className="w-full cursor-pointer rounded bg-gray-200 p-2 text-sm"
                value={selectedCardColumnId || ''}
                onChange={(e) => moveCardFromModal(e.target.value)}
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}로 이동
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  archiveCard(selectedCardColumnId, selectedCard.id)
                }
                className="w-full rounded bg-red-100 p-2 text-left text-sm text-red-600 hover:bg-red-200"
              >
                아카이브
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
