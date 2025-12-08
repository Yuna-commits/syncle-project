import { Check, X } from 'lucide-react'
import { useState } from 'react'
import useBoardStore from '../../../stores/useBoardStore'
import CardActivity from '../../card/CardActivity'
import CardChecklist from '../../card/CardChecklist'
import CardDescription from '../../card/CardDescription'
import CardSidebar from '../../card/CardSidebar'

export default function CardDetailModal() {
  const { activeBoard, selectedCard, closeCardModal } = useBoardStore()

  // 체크리스트 표시 여부 상테
  // - 아이템이 있으면 자동 펼침
  const [showChecklist, setShowChecklist] = useState(
    selectedCard.checklists && selectedCard.checklists.length > 0,
  )

  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  if (!selectedCard || !activeBoard) return null

  const currentColumn = activeBoard.columns[selectedCard.listId]

  const toggleComplete = () => {
    setIsComplete((prev) => !prev)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

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
            <CardSidebar onAddChecklist={() => setShowChecklist(true)} />
          </div>
        </div>
      </div>
    </div>
  )
}
