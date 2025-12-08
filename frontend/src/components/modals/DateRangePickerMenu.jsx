import React from 'react'
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
}) {
  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 z-60 hover:cursor-pointer"
        onClick={onClose}
      />
      <div
        className="animate-fade-in fixed z-70 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl"
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
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
