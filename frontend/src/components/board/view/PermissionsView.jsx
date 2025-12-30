import React, { useEffect, useState } from 'react'
import { useBoardSettings } from '../../../hooks/board/useBoardSettings'
import { useQueryClient } from '@tanstack/react-query'

function PermissionsView({ board, isOwner }) {
  const queryClient = useQueryClient()
  const { updateSettings, isLoading } = useBoardSettings(board.id)

  // 서버에서 불러온 설정값이 있으면 로컬 상태 동기화
  const [perms, setPerms] = useState({
    invitation: board.invitationPermission || 'OWNER',
    boardSharing: board.boardSharingPermission || 'OWNER',
    listEdit: board.listEditPermission || 'OWNER',
    cardDelete: board.cardDeletePermission || 'OWNER',
  })

  useEffect(() => {
    setPerms((prev) => ({
      ...prev,
      invitation: board.invitationPermission ?? prev.invitation,
      boardSharing: board.boardSharingPermission ?? prev.boardSharing,
      listEdit: board.listEditPermission ?? prev.listEdit,
      cardDelete: board.cardDeletePermission ?? prev.cardDelete,
    }))
  }, [board])

  const handleChange = (key, value) => {
    setPerms((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    updateSettings(perms, {
      onSuccess: () => {
        queryClient.invalidateQueries(['board', board.id])
        alert('권한 설정이 저장되었습니다.')
      },
    })
  }

  if (isLoading)
    return (
      <div className="py-4 text-center text-xs text-gray-500">
        설정 로딩 중...
      </div>
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-5">
        {/* 1. 멤버 초대 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            보드 멤버 초대
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.invitation}
            onChange={(e) => handleChange('invitation', e.target.value)}
            disabled={!isOwner}
          >
            <option value="OWNER">관리자만 가능</option>
            <option value="MEMBERS">모든 멤버 가능</option>
          </select>
        </div>

        {/* 2. 보드 공유 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            보드 공유
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.boardSharing}
            onChange={(e) => handleChange('boardSharing', e.target.value)}
            disabled={!isOwner}
          >
            <option value="OWNER">관리자만 가능</option>
            <option value="MEMBERS">모든 멤버 가능</option>
          </select>
        </div>

        {/* 3. 리스트 편집 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            리스트 추가 및 변경
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.listEdit}
            onChange={(e) => handleChange('listEdit', e.target.value)}
            disabled={!isOwner}
          >
            <option value="OWNER">관리자만 가능</option>
            <option value="MEMBERS">모든 멤버 가능</option>
          </select>
        </div>

        {/* 4. 카드 삭제 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            카드 삭제
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.cardDelete}
            onChange={(e) => handleChange('cardDelete', e.target.value)}
            disabled={!isOwner}
          >
            <option value="OWNER">관리자만 가능</option>
            <option value="MEMBERS">모든 멤버 가능</option>
          </select>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="pt-2">
        {isOwner ? (
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            권한 설정 저장
          </button>
        ) : (
          <p className="text-center text-xs text-gray-400">
            관리자만 권한 설정을 변경할 수 있습니다.
          </p>
        )}
      </div>
    </form>
  )
}

export default PermissionsView
