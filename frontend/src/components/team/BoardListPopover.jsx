import { useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { teamApi } from '../../api/team.api'
import Portal from '../ui/Portal'
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'

function BoardListPopover({ memberId, teamId, initialBoards }) {
  const [isOpen, setIsOpen] = useState(false)
  const [boards, setBoards] = useState(initialBoards || [])
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient() // 캐시 업데이트용

  // Floating UI 훅 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8), // 버튼과 팝업 사이 간격 8px
      flip(), // 공간 부족 시 위/아래 뒤집기
      shift(), // 화면 밖으로 나가지 않게 이동
    ],
    whileElementsMounted: autoUpdate, // 스크롤/리사이즈 시 위치 자동 업데이트
    placement: 'bottom-start', // 기본 위치: 버튼 아래쪽, 왼쪽 정렬
  })

  // 상호작용 훅 (클릭해서 열기, 외부 클릭해서 닫기)
  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  // 보드 보기 토글
  const handleLoadData = async () => {
    // 데이터가 없으면 로딩
    if (!boards || boards.length === 0) {
      try {
        setIsLoading(true)
        // [API 호출] 해당 멤버의 보드 목록 가져오기
        // 경로는 백엔드 명세에 따라 수정 필요 (예: /teams/{teamId}/members/{memberId}/boards)
        const res = await teamApi.getMemberParticipatedBoards(teamId, memberId)
        const fetchedBoards = res.data.data || [] // 데이터가 없으면 빈 배열
        setBoards(fetchedBoards)

        // React Query 캐시 업데이트 - UI 즉시 반영
        queryClient.setQueryData(['team', Number(teamId)], (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            members: oldData.members.map((m) =>
              m.userId === memberId ? { ...m, boards: fetchedBoards } : m,
            ),
          }
        })
      } catch (error) {
        console.error('보드 목록 조회 실패', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: () => {
            if (!isOpen) handleLoadData()
          },
        })}
        className="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:cursor-pointer hover:bg-gray-200 focus:outline-none"
      >
        보드 보기
      </button>

      {isOpen && (
        <Portal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className="ring-opacity-5 animate-fade-in z-50 w-56 rounded-md bg-white shadow-lg ring-1 ring-blue-200 focus:outline-none"
            >
              {/* 팝업 헤더 */}
              <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3">
                <h4 className="text-sm font-bold text-gray-700">참여 보드</h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  이 멤버가 현재 참여 중인 보드입니다.
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-xs text-gray-500">
                    로딩 중...
                  </div>
                ) : boards.length === 0 ? (
                  <div className="px-4 py-3 text-center text-xs text-gray-500">
                    참여한 보드가 없습니다.
                  </div>
                ) : (
                  boards.map((board) => (
                    <div
                      key={board.id}
                      className="flex cursor-default items-center px-4 py-2 hover:bg-gray-100"
                    >
                      <span
                        className="mr-2 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: board.color || '#3b82f6' }}
                      />
                      <span className="truncate text-sm text-gray-700">
                        {board.name || board.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </Portal>
      )}
    </>
  )
}

export default BoardListPopover
