import { Check, Clock, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import useBoardStore from '../../../stores/useBoardStore'
import CardActivity from '../../card/CardActivity'
import CardChecklist from '../../card/CardChecklist'
import CardDescription from '../../card/CardDescription'
import CardSidebar from '../../card/CardSidebar'
import { getDateStatusStyle } from '../../../utils/dateUtils'
import { useCardMutations } from '../../../hooks/useCardMutations'

export default function CardDetailModal() {
  const { activeBoard, selectedCard, closeCardModal } = useBoardStore()
  const { updateCard } = useCardMutations(activeBoard?.id)

  // 체크리스트 표시 여부 상테
  // - 아이템이 있으면 자동 펼침
  const [showChecklist, setShowChecklist] = useState(
    selectedCard.checklists && selectedCard.checklists.length > 0,
  )

  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 모달이 열리거나 selectedCard가 바뀔 때 상태 동기화
  useEffect(() => {
    if (selectedCard) {
      setIsComplete(selectedCard.isComplete || false)
    }
  }, [selectedCard])

  if (!selectedCard || !activeBoard) return null

  const currentColumn = activeBoard.columns[selectedCard.listId]

  // 완료 토글 핸들러
  const toggleComplete = () => {
    const nextState = !isComplete

    // UI 즉시 반영 (낙관적 업데이트)
    setIsComplete((prev) => !prev)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // 업데이트
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        isComplete: nextState,
      },
    })
  }

  // 날짜 스타일 계산
  const dateStatus = getDateStatusStyle(selectedCard.dueDate)

  return (
    <div
      onClick={closeCardModal}
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 bg-white px-6 pt-5 pb-3">
          <div className="flex w-full gap-4 pr-10">
            <button
              onClick={toggleComplete}
              className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                isComplete
                  ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                  : 'border-gray-300 bg-transparent text-transparent hover:border-gray-400 hover:bg-gray-200'
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

            {/* 카드 제목 */}
            <div className="w-full pt-0.5">
              <h2
                className={`mb-1 text-xl leading-tight font-bold text-gray-900 transition-all duration-300 ${
                  isComplete ? 'text-gray-400 line-through' : ''
                }`}
              >
                {selectedCard.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {/* 리스트 제목 */}
                <p className="flex items-center text-sm text-gray-500">
                  <span className="ml-1 font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4">
                    {currentColumn?.title}
                  </span>
                </p>

                {/* 마감일 뱃지 */}
                {dateStatus.dateLabel && (
                  <div
                    className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs hover:cursor-pointer ${dateStatus.bg} ${dateStatus.text}`}
                    title="마감일"
                  >
                    <Clock size={12} />
                    <span>{dateStatus.dateLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={closeCardModal}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-5">
          <div className="flex flex-col gap-10 md:flex-row">
            {/* [Left Column] Main Content */}
            <div className="flex flex-1 flex-col gap-10">
              {/* Description */}
              <CardDescription />

              {/* Checklist Section */}
              {showChecklist && (
                // 체크리스트가 있으면 렌더링
                <CardChecklist items={selectedCard.checklists || []} />
              )}

              {/* Activity Section */}
              <CardActivity />
            </div>

            {/* [Right Column] Sidebar Actions */}
            <CardSidebar
              onAddChecklist={() => setShowChecklist((prev) => !prev)}
              showChecklist={showChecklist}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
