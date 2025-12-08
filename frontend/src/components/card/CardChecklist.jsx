import { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { CheckSquare, Trash2 } from 'lucide-react'

function CardChecklist({ items }) {
  const { selectedCard, createChecklist, updateChecklist, deleteChecklist } =
    useBoardStore()

  const [checklistInput, setChecklistInput] = useState('')

  // 진행률 계산
  const total = items.length
  const doneCount = items.filter((i) => i.done).length
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  // 체크리스트 추가
  const handleAddChecklist = (e) => {
    e.preventDefault()
    if (!checklistInput.trim()) return

    createChecklist(selectedCard.id, selectedCard.listId, checklistInput)
    setChecklistInput('')
  }

  // 체크리스트 완료 토글 (done 필드 사용)
  const toggleCheckItem = (itemId, currentDone) => {
    updateChecklist(selectedCard.id, selectedCard.listId, itemId, {
      done: !currentDone, // [변경] isChecked -> done
    })
  }

  // 체크리스트 삭제
  const handleDeleteItem = (itemId) => {
    if (window.confirm('삭제하시겠습니까?')) {
      deleteChecklist(selectedCard.id, selectedCard.listId, itemId)
    }
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">체크리스트</h3>
        </div>
        {total > 0 && (
          <span className="text-xs font-medium text-gray-500">
            {progress}% 완료
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
          {items.map((item) => (
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
            className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm transition-all outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            placeholder="항목 추가..."
            value={checklistInput}
            onChange={(e) => setChecklistInput(e.target.value)}
          />
        </form>
      </div>
    </section>
  )
}

export default CardChecklist
