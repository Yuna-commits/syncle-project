import { Tag, Trash2, Check } from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { LABEL_COLORS } from '../../constants/priority'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import useBoardStore from '../../stores/useBoardStore'
import useBoardPermission from '../../hooks/board/useBoardPermission'

export default function CardLabel({ handleMenuClick }) {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { updateCard } = useCardMutations(activeBoard?.id)

  const [isOpen, setIsOpen] = useState(false)
  const [labelName, setLabelName] = useState('')
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value)
  const { canEdit } = useBoardPermission(activeBoard)

  const buttonRef = useRef(null)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })

  // 보드 내에서 사용 중인 색상별 라벨 이름을 한 번에 매핑
  const usedLabelsMap = useMemo(() => {
    const map = {}
    if (!activeBoard?.columns) return map

    Object.values(activeBoard.columns).forEach((col) => {
      col.tasks?.forEach((task) => {
        if (task.labelColor && task.label?.trim()) {
          // 이미 찾은 색상이면 무시
          if (!map[task.labelColor]) {
            map[task.labelColor] = task.label
          }
        }
      })
    })
    return map
  }, [activeBoard])

  useEffect(() => {
    if (selectedCard) {
      setLabelName(selectedCard.label || '')
      setSelectedColor(selectedCard.labelColor || LABEL_COLORS[0].value)
    }
  }, [selectedCard])

  if (!selectedCard) return null

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    setIsOpen(!isOpen)
  }

  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue)
    // 매핑된 맵에서 즉시 이름을 찾아 설정 (반복문 제거로 성능 향상)
    setLabelName(usedLabelsMap[colorValue] || '')
  }

  const handleSave = () => {
    if (!labelName.trim()) return
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: { label: labelName, labelColor: selectedColor },
    })
    setIsOpen(false)
  }

  const handleDelete = () => {
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: { label: null, labelColor: null, removeLabel: true },
    })
    setLabelName('')
    setIsOpen(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => handleMenuClick(toggleMenu)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
          isOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Tag size={16} className="text-gray-500" />
        <span className="font-medium text-gray-500">라벨</span>
        {selectedCard.label && (
          <span
            className="ml-auto block max-w-20 truncate rounded px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: selectedCard.labelColor || '#6b7280' }}
          >
            {selectedCard.label}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="animate-in fade-in zoom-in-95 fixed z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-2xl duration-100"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />

            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700">라벨 설정</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="라벨 이름 입력..."
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />

            <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              색상 및 기존 라벨
            </p>

            {/* [개선] 색상 선택 리스트 스타일링 */}
            <div className="mb-5 flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
              {LABEL_COLORS.map((color) => {
                const isSelected = selectedColor === color.value
                const existingName = usedLabelsMap[color.value]

                return (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`group relative flex items-center gap-3 rounded-md px-2 py-1.5 transition-all ${
                      isSelected
                        ? 'bg-gray-100 ring-1 ring-gray-200 ring-inset'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* 색상 아이콘 */}
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded shadow-inner"
                      style={{ backgroundColor: color.value }}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* 라벨 이름 표시 */}
                    <span
                      className={`truncate text-xs ${existingName ? 'font-medium text-gray-700' : 'text-gray-400 italic'}`}
                    >
                      {existingName || '이름 없음'}
                    </span>

                    {/* 현재 선택 상태 표시 */}
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold text-blue-600">
                        선택됨
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer - 버튼 영역을 확실히 분리 */}
            <div className="flex items-center justify-between rounded-b-xl border-t border-gray-100 bg-gray-50/50 px-4 py-3">
              {selectedCard.label ? (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!labelName.trim()}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:bg-blue-200 disabled:shadow-none"
                >
                  저장
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
