import { ArrowRight, CheckSquare, Clock, Tag, Trash2, User } from 'lucide-react'
import useBoardStore from '../../stores/useBoardStore'

function CardSidebar({ onAddChecklist, showChecklist }) {
  const { activeBoard, selectedCard, moveCard } = useBoardStore()

  // 모든 컬럼 목록 (이동 옵션용)
  const allColumns = activeBoard.columns
    ? Object.values(activeBoard.columns)
    : []

  const handleMoveCard = (e) => {
    const newColId = Number(e.target.value) || e.target.value
    if (newColId && newColId !== selectedCard.listId) {
      const targetColumn = activeBoard.columns[newColId]
      const newIndex = targetColumn.tasks ? targetColumn.tasks.length : 0

      moveCard(selectedCard.id, selectedCard.listId, newColId, newIndex)
    }
  }

  return (
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
          onClick={onAddChecklist}
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
            value={selectedCard.listId}
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
  )
}

export default CardSidebar
