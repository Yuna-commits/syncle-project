import { Tag, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { LABEL_COLORS } from '../../constants/priority' // 상수 경로 주의 (없다면 파일 내 선언 또는 적절한 곳에서 import)
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import useBoardStore from '../../stores/useBoardStore'

// 만약 LABEL_COLORS가 constants에 없다면 여기에 선언해서 사용하세요.
const PRESET_COLORS = LABEL_COLORS || [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Black', value: '#1f2937' },
]

export default function CardLabel() {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { updateCard } = useCardMutations(activeBoard?.id)

  const [isOpen, setIsOpen] = useState(false)
  const [labelName, setLabelName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)

  const buttonRef = useRef(null)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })

  // 선택된 카드 정보 동기화
  useEffect(() => {
    if (selectedCard) {
      setLabelName(selectedCard.label || '')
      setSelectedColor(selectedCard.labelColor || PRESET_COLORS[0].value)
    }
  }, [selectedCard])

  if (!selectedCard) return null

  // 메뉴 토글
  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    setIsOpen(!isOpen)
  }

  // 저장
  const handleSave = () => {
    if (!labelName.trim()) return

    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        label: labelName,
        labelColor: selectedColor,
      },
    })
    setIsOpen(false)
  }

  // 삭제
  const handleDelete = () => {
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        label: null,
        labelColor: null,
        removeLabel: true,
      },
    })
    setLabelName('')
    setIsOpen(false)
  }

  return (
    <>
      {/* 사이드바 버튼 */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:cursor-pointer ${
          isOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Tag size={16} className="text-gray-500" />
        <span className="text-gray-500">라벨</span>

        {/* 라벨이 설정되어 있으면 우측에 뱃지 표시 */}
        {selectedCard.label && (
          <span
            className="ml-auto block max-w-[80px] truncate rounded px-2 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: selectedCard.labelColor || '#6b7280' }}
          >
            {selectedCard.label}
          </span>
        )}
      </button>

      {/* 팝업 메뉴 (Portal 사용) */}
      {isOpen &&
        createPortal(
          <div
            className="animate-in fade-in zoom-in-95 fixed z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl duration-100"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />

            <h4 className="mb-2 text-xs font-semibold text-gray-500">
              라벨 설정
            </h4>

            {/* 이름 입력 */}
            <input
              type="text"
              placeholder="라벨 이름"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />

            {/* 색상 선택 */}
            <div className="mb-4 grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                    selectedColor === color.value
                      ? 'scale-110 ring-2 ring-blue-500 ring-offset-1'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="flex items-center justify-between gap-2">
              {selectedCard.label && (
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                  title="라벨 삭제"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex flex-1 justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!labelName.trim()}
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
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
