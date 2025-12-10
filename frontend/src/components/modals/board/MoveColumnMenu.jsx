import React from 'react'
import { Check } from 'lucide-react'
import Portal from '../../ui/Portal'

const MoveColumnMenu = ({
  isOpen,
  onClose,
  position,
  columns,
  currentListId,
  onSelectColumn,
}) => {
  if (!isOpen) return null

  return (
    <Portal>
      {/* 1. 배경 오버레이 (클릭 시 닫힘) */}
      <div
        className="fixed inset-0 z-60 hover:cursor-pointer"
        onClick={onClose}
      />

      {/* 2. 메뉴 컨텐츠 */}
      <div
        className="animate-fade-in fixed z-70 w-64 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl"
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
        }}
      >
        {/* 헤더 영역 (MemberPickerMenu와 스타일 통일) */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase">
            이동할 리스트 선택
          </h4>
        </div>

        {/* 리스트 영역 */}
        <div className="max-h-60 overflow-y-auto p-2">
          <div className="space-y-1">
            {columns.map((col) => {
              const isCurrent = col.id === currentListId
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    onSelectColumn(col.id)
                    // onClose()는 CardSidebar의 handleMoveCard 안에서 호출하거나 여기서 호출
                  }}
                  disabled={isCurrent}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? 'cursor-default bg-blue-50 text-blue-600'
                      : 'cursor-pointer text-gray-700 hover:bg-gray-200'
                  } `}
                >
                  <span className="font-medium">{col.title}</span>
                  {isCurrent && <Check size={18} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default MoveColumnMenu
