import React, { useState } from 'react'

function ArchiveView() {
  // const { restoreCard, deleteCardForever } = useBoardStore()
  const [cards, setCards] = useState([])

  return (
    <div className="space-y-3 py-2">
      <div className="flex rounded-md bg-gray-100 p-1">
        <button className="flex-1 rounded bg-white py-1 text-xs font-medium text-gray-800 shadow-sm">
          카드
        </button>
        <button className="flex-1 rounded py-1 text-xs font-medium text-gray-500 hover:text-gray-700">
          리스트
        </button>
      </div>

      <div className="space-y-2">
        {cards.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            항목이 없습니다.
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="rounded-md border border-gray-200 bg-white p-2 shadow-sm"
            >
              <div className="mb-2 flex items-start gap-2">
                <CreditCard size={14} className="mt-0.5 text-gray-400" />
                <span className="text-sm leading-tight font-medium text-gray-700">
                  {card.title}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 hover:underline"
                >
                  <RotateCcw size={10} />
                  보드로 복구
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {}}
                  className="text-gray-500 hover:text-red-600 hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="py-8 text-center text-xs text-gray-400">
        아카이브 기능은 모든 멤버가 볼 수 있습니다.
      </div>
    </div>
  )
}

export default ArchiveView
