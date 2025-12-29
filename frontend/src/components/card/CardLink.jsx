import { Link2, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCardMutations } from '../../hooks/card/useCardMutations'
import FormInput from '../common/FormInput'
import FormButton from '../common/FormButton'

export default function CardLink({ card, boardId }) {
  const [isEditing, setIsEditing] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const { updateCard } = useCardMutations(boardId)

  useEffect(() => {
    setLinkUrl('')
  }, [])

  const handleSave = () => {
    // 간단한 URL 유효성 검사 (필요 시 강화)
    let finalUrl = linkUrl.trim()
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    updateCard({
      cardId: card.id,
      listId: card.listId,
      updates: { link: finalUrl },
    })
    setIsEditing(false)
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Link2 size={20} className="text-gray-700" />
        <h3 className="font-semibold text-gray-700">링크</h3>
      </div>

      <div className="ml-7">
        {isEditing ? (
          <div className="flex gap-2">
            <FormInput
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL을 입력하세요 (예: https://github.com/...)"
              autoFocus
            />
            <div className="flex shrink-0 gap-1">
              <FormButton onClick={handleSave} className="h-10 px-3">
                저장
              </FormButton>
              <button
                onClick={() => setIsEditing(false)}
                className="h-10 rounded px-3 text-gray-500 hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {card ? (
              <a
                href={card}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 break-all text-blue-600 hover:underline"
              >
                <ExternalLink size={14} />
                {card}
              </a>
            ) : (
              <span className="text-sm text-gray-400">
                등록된 링크가 없습니다.
              </span>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              수정
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
