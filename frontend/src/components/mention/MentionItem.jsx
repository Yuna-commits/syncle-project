import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { useMemo, useState } from 'react'
import MentionProfileMenu from './MentionProfileMenu'

function MentionItem({ nickname, members }) {
  const [isOpen, setIsOpen] = useState(false)

  // 닉네임에서 '@' 제거 후 실제 사용자 찾기
  const targetUser = useMemo(() => {
    const pureNickname = nickname.replace('@', '')
    return members.find((m) => m.name === pureNickname)
  }, [nickname, members])

  // Floating UI 훅 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'right-start', // 오른쪽 시작점 정렬
    whileElementsMounted: autoUpdate, // 스크롤 시 위치 자동 업데이트
    middleware: [
      offset(8), // 멘션 텍스트와 10px 간격 띄우기
      flip(), // 공간 없으면 반대쪽(왼쪽)으로 뒤집기
      shift(), // 화면 밖으로 나가지 않게 밀어넣기
    ],
  })

  // 인터랙션 설정 (클릭 시 열기, 바깥 클릭 시 닫기)
  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  // 사용자를 찾지 못했으면 그냥 텍스트로 표시
  if (!targetUser) {
    return (
      <span className="font-bold text-blue-600 opacity-70">{nickname}</span>
    )
  }

  return (
    <>
      {/* Trigger: 멘션 텍스트 */}
      <span
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: (e) => {
            e.stopPropagation()
          },
        })}
        className={`cursor-pointer rounded px-0.5 font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:underline ${
          isOpen ? 'bg-blue-100' : ''
        }`}
      >
        {nickname}
      </span>

      {/* Popup: 프로필 카드 (FloatingPortal 안에 렌더링) */}
      {isOpen && (
        <FloatingPortal>
          <MentionProfileMenu
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            user={targetUser}
          />
        </FloatingPortal>
      )}
    </>
  )
}

export default MentionItem
