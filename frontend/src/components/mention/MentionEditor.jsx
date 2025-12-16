import { useMemo, useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'
import { useParams } from 'react-router-dom'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import { mentionInputStyle, mentionStyle } from '../../styles/mentionStyles'

const MentionEditor = ({
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder = '',
  submitLabel = '저장',
  minHeight = 44, // 높이 조절용 Prop
  autoFocus = false,
  showButtons = true, // 버튼 표시 여부
}) => {
  const [text, setText] = useState(initialValue)

  const { boardId } = useParams()
  // 캐싱 데이터 활용
  const { data: activeBoard } = useBoardQuery(Number(boardId))

  // 멘션 대상 멤버 목록 필터링
  const mentionCandidates = useMemo(() => {
    if (!activeBoard) return []

    // 공개 범위에 따라 사용할 멤버 리스트 결정
    const members =
      activeBoard.visibility === 'PRIVATE'
        ? activeBoard.members // 보드 멤버
        : activeBoard.teamMembers // 팀 멤버

    // 라이브러리 포맷에 맞게 변환 ({id, display})
    return (members || []).map((m) => ({
      id: m.id,
      display: m.name,
    }))
  }, [activeBoard])

  const handleSubmit = () => {
    if (!text.trim()) return
    // 라이브러리 포맷(@[닉네임]) => 순수 텍스트(@닉네임)로 변환
    const plainText = text.replace(/@\[(.*?)\]/g, '@$1')
    onSubmit(plainText)

    // 제출 후 초기화 (설명창은 초기화 x)
    if (showButtons) setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 높이 스타일 동적 적용
  const customInputStyle = {
    ...mentionInputStyle,
    control: {
      ...mentionInputStyle.control,
      minHeight: minHeight,
    },
    '&multiLine': {
      ...mentionInputStyle['&multiLine'],
      control: {
        ...mentionInputStyle['&multiLine'].control,
        minHeight: minHeight,
      },
    },
  }

  return (
    <div className="relative w-full">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <MentionsInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={customInputStyle}
          autoFocus={autoFocus}
          a11ySuggestionsListLabel={'Suggested mentions'}
          classNames={{
            input: 'focus:outline-none rounded-xl', // 기본 outline 제거
          }}
        >
          {/* @ 트리거 설정 */}
          <Mention
            trigger="@"
            data={mentionCandidates}
            style={mentionStyle}
            // 내부적으로는 @[닉네임] 형태로 관리
            markup="@[__display__]"
            displayTransform={(id, display) => `@${display}`}
            appendSpaceOnAdd={true}
          />
        </MentionsInput>
      </div>

      {showButtons && (
        <div className="absolute right-2 bottom-2 flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded px-3 py-1 text-xs text-gray-600 hover:cursor-pointer hover:bg-blue-100"
            >
              취소
            </button>
          )}
          {text && (
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:cursor-pointer hover:bg-blue-700"
            >
              {submitLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MentionEditor
