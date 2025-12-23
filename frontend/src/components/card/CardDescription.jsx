import React, { useState } from 'react'
import useBoardStore from '../../stores/useBoardStore'
import { AlignLeft } from 'lucide-react'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import { useParams } from 'react-router-dom'
import MentionEditor from '../mention/MentionEditor'
import MentionRenderer from '../mention/MentionRenderer'
import useBoardPermission from '../../hooks/board/useBoardPermission'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'

function CardDescription() {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { updateCard } = useCardMutations(boardId)

  const [isEditing, setIsEditing] = useState(false)
  const { data: board } = useBoardQuery(Number(boardId))
  const { canEdit } = useBoardPermission(board)

  if (!selectedCard) return null

  const handleSaveDescription = (newDescription) => {
    updateCard({
      cardId: selectedCard.id,
      listId: selectedCard.listId,
      updates: {
        description: newDescription,
      },
    })
    setIsEditing(false)
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlignLeft size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">설명</h3>
        </div>

        {!isEditing && selectedCard.description && canEdit && (
          <button
            onClick={() => canEdit && setIsEditing(true)}
            className="rounded-md bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-500 hover:cursor-pointer hover:bg-blue-100"
          >
            편집
          </button>
        )}
      </div>

      <div className="pl-8">
        {isEditing && canEdit ? (
          <div className="w-full">
            <MentionEditor
              initialValue={selectedCard.description || ''}
              onSubmit={handleSaveDescription}
              onCancel={() => setIsEditing(false)}
              placeholder="이 카드에 대한 상세 설명을 추가하려면 클릭하세요... (@멤버 멘션 가능)"
              submitLabel="저장"
              minHeight={120}
              autoFocus={true}
            />
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={`min-h-20 cursor-pointer rounded-xl p-3 transition-colors ${
              selectedCard.description
                ? 'hover:bg-gray-50'
                : 'flex items-center bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {selectedCard.description ? (
              <MentionRenderer content={selectedCard.description} />
            ) : (
              <p className="text-sm">
                {canEdit
                  ? '이 카드에 대한 상세 설명을 추가하려면 클릭하세요... (@멤버 멘션 가능)'
                  : '상세 설명이 없습니다.'}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default CardDescription
