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
  const queryClient = useQueryClient()

  // Floating UI 훅 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  // 보드 데이터 로드
  const handleLoadData = async () => {
    if (!boards || boards.length === 0) {
      try {
        setIsLoading(true)
        const res = await teamApi.getMemberParticipatedBoards(teamId, memberId)
        const fetchedBoards = res.data.data || []
        setBoards(fetchedBoards)

        // React Query 캐시 업데이트
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
              className="animate-fade-in z-50 w-64 rounded-md bg-white shadow-lg ring-1 ring-blue-200 focus:outline-none"
            >
              {/* 팝업 헤더 */}
              <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">참여 보드</h4>

                  {/* 색상 범례 (Legend) */}
                  <div className="flex gap-2 text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">전체 공개</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      <span className="text-gray-500">비공개</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  이 멤버가 현재 참여 중인 보드입니다.
                </p>
              </div>

              {/* 목록 영역 */}
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
                  boards.map((board) => {
                    const isPublic = board.visibility === 'PUBLIC'
                    const statusColor = isPublic
                      ? 'bg-green-500'
                      : 'bg-orange-500'

                    return (
                      <div
                        key={board.id}
                        className="flex cursor-default items-center px-4 py-2 hover:bg-gray-100"
                      >
                        {/* 상태 색상 표시 */}
                        <span
                          className={`mr-2 h-2.5 w-2.5 shrink-0 rounded-full ${statusColor}`}
                        />
                        <span className="truncate text-sm text-gray-700">
                          {board.name || board.title}
                        </span>
                      </div>
                    )
                  })
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
