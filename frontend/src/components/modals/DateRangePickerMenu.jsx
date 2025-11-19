import React, { useEffect, useRef } from 'react'
import { DateRange } from 'react-date-range'

export default function DateRangePickerModal({
  isOpen,
  onClose,
  range,
  setRange,
}) {
  const modalRef = useRef(null)

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        ref={modalRef}
        className="absolute top-full right-0 z-50 mt-2 rounded-xl border border-gray-300 bg-white shadow-lg"
      >
        <DateRange
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

        {/* 전체 기간 초기화 버튼 */}
        <div className="border-t border-gray-300 p-3 text-right">
          <button
            onClick={() => {
              // 전체 기간 모드 → range를 null로
              setRange(null)
              onClose()
            }}
            className="rounded bg-gray-100 px-3 py-1 text-sm text-blue-600 hover:cursor-pointer hover:bg-gray-200"
          >
            초기화
          </button>
        </div>
      </div>
    </>
  )
}
