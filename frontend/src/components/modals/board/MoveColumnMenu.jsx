import React, { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { createPortal } from 'react-dom'

const MoveColumnMenu = ({ isOpen, onClose, position, columns, currentListId, onSelectColumn }) => {
  const menuRef = useRef(null)

  // 외부 클릭 감지 (메뉴 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // 모달을 body에 렌더링 (Portal 사용 - z-index 문제 방지)
  return createPortal(
    <div
      ref={menuRef}
      style={{
        top: position.top,
        left: position.left,
      }}
      className="fixed z-50 w-60 rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="p-2">
        <div className="mb-2 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
          이동할 리스트 선택
        </div>
        <div className="space-y-1">
          {columns.map((col) => {
            const isCurrent = col.id === currentListId
            return (
              <button
                key={col.id}
                onClick={() => onSelectColumn(col.id)}
                disabled={isCurrent}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors
                  ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-600 cursor-default'
                      : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                  }
                `}
              >
                <span>{col.title}</span>
                {isCurrent && <Check size={16} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default MoveColumnMenu