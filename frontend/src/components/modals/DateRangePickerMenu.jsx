import React, { useEffect, useRef } from 'react'
import { ko } from 'date-fns/locale'
import { DateRange } from 'react-date-range'
import Portal from '../ui/Portal'

export default function DateRangePickerMenu({
  isOpen,
  onClose,
  range,
  setRange,
  onApply,
  position,
  buttonRef,
}) {
  const menuRef = useRef(null)

  // 1. 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event) {
      // 달력 메뉴 내부를 클릭한 경우는 무시
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return
      }

      // 마감일 버튼 클릭 시 무시
      if (
        buttonRef &&
        buttonRef.current &&
        buttonRef.current.contains(event.target)
      ) {
        return
      }

      // 외부 클릭 시 닫기
      onClose()
    }

    // mousedown 이벤트 사용 (click보다 반응 빠름 & 드래그 이슈 방지)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  return (
    <Portal>
      <div
        ref={menuRef}
        className="animate-fade-in fixed z-70 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl"
        style={{
          top: position?.top ?? 0,
          // right 값이 있으면 우측 정렬, 없으면 left 사용
          ...(position?.right !== undefined
            ? { right: position.right }
            : { left: position?.left ?? 0 }),
        }}
      >
        <DateRange
          locale={ko}
          editableDateInputs={true}
          onChange={(item) => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={
            range || [
              {
                startDate: new Date(),
                endDate: new Date(),
                key: 'selection',
              },
            ]
          }
          rangeColors={['#3b82f6']}
        />
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 border-t border-gray-200 p-3">
          <button
            onClick={() => {
              // 초기화: range를 null로 설정
              setRange(null)
              onApply(null)
              onClose()
            }}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-500 hover:cursor-pointer hover:bg-blue-200"
          >
            초기화
          </button>
          <button
            onClick={() => {
              onApply(range)
              onClose()
            }}
            className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:cursor-pointer hover:bg-blue-600"
          >
            적용
          </button>
        </div>
      </div>
    </Portal>
  )
}
