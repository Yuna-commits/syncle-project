import React, { useEffect, useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { AlignLeft } from 'lucide-react'
import { useCardMutations } from '../../hooks/useCardMutations'
import { useParams } from 'react-router-dom'

function CardDescription() {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { updateCard } = useCardMutations(boardId)

  const [description, setDescription] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)

  // 카드가 바뀔 때마다 설명 초기화
  useEffect(() => {
    if (selectedCard) {
      setDescription(selectedCard.description || '')
    }
  }, [selectedCard])

  const handleSaveDescription = () => {
    setIsEditingDesc(false)
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        description,
      },
    })
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <AlignLeft size={20} className="text-gray-600" />
        <h3 className="text-base font-semibold text-gray-800">설명</h3>
      </div>
      <div className="pl-8">
        {isEditingDesc ? (
          <div className="space-y-2">
            <textarea
              className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-700 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveDescription}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditingDesc(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingDesc(true)}
            className={`min-h-20 cursor-pointer rounded-xl p-4 transition-colors ${
              description
                ? 'bg-transparent font-medium text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {description ||
                '이 카드에 대한 상세 설명을 추가하려면 클릭하세요...'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CardDescription
