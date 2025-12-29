import { Flag } from 'lucide-react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { PRIORITY_OPTIONS } from '../../constants/priority'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import useBoardStore from '../../stores/useBoardStore'
import useBoardPermission from '../../hooks/board/useBoardPermission'

export default function CardPriority({ handleMenuClick }) {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: activeBoard } = useBoardQuery(boardId)
  const { updateCard } = useCardMutations(activeBoard?.id)

  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })
  const { canEdit } = useBoardPermission(activeBoard)

  // 메뉴 토글
  const toggleMenu = () => {
    if (!canEdit) return
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPos({ top: rect.bottom + 8, left: rect.left })
    }
    setIsOpen(!isOpen)
  }

  // 우선순위 변경 핸들러
  const handleUpdatePriority = (priorityKey) => {
    if (priorityKey === null) {
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: { priority: null, removePriority: true },
      })
    } else {
      updateCard({
        cardId: selectedCard.id,
        listId: selectedCard.listId,
        updates: { priority: priorityKey },
      })
    }
    setIsOpen(false)
  }

  // 현재 선택된 우선순위 정보
  const currentPriority = PRIORITY_OPTIONS.find(
    (p) => p.key === selectedCard.priority,
  )

  return (
    <>
      {/* 사이드바 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => handleMenuClick(toggleMenu)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${canEdit ? 'hover:cursor-pointer' : 'cursor-default opacity-60'} ${
          isOpen ? 'bg-blue-100' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Flag size={16} className="text-gray-500" />
        <span className="text-gray-500">우선순위</span>

        {/* 선택된 우선순위 뱃지 */}
        {currentPriority && (
          <span
            className={`ml-auto rounded px-2 py-0.5 text-xs font-semibold ${currentPriority.color} ${currentPriority.hoverColor}`}
          >
            {currentPriority.label}
          </span>
        )}
      </button>

      {/* 포탈을 사용한 팝업 메뉴 (body에 렌더링) */}
      {isOpen &&
        createPortal(
          <div
            className="animate-in fade-in zoom-in-95 fixed z-50 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg duration-100"
            style={{
              top: popupPos.top,
              left: popupPos.left,
            }}
          >
            {/* 배경 클릭 시 닫기 (Backdrop) */}
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />

            <div className="flex flex-col p-1">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleUpdatePriority(option.key)}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer ${option.color} ${option.hoverColor}`}
                >
                  <Flag size={14} className={option.iconColor} />
                  <span className="font-medium">{option.label}</span>
                  {selectedCard.priority === option.key && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}

              {/* 우선순위 제거 옵션 */}
              {selectedCard.priority && (
                <button
                  onClick={() => handleUpdatePriority(null)}
                  className="mt-1 w-full rounded px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100"
                >
                  제거
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
