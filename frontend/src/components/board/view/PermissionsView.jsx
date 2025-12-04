import React, { useState } from 'react'
import useBoardStore from '../../../stores/useBoardStore'

function PermissionsView({ board, isOwner }) {
  const { updatePermissions } = useBoardStore()
  const [perms, setPerms] = useState(
    board.permissions || {
      comment: 'MEMBERS',
      invitation: 'OWNER',
      edit: 'OWNER',
    },
  )

  const handleChange = (key, value) => {
    setPerms((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updatePermissions(board.id, perms)
    alert('권한 설정이 저장되었습니다.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-4">
        {/* 댓글 작성 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            댓글 작성
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            disabled={!isOwner}
          >
            <option value="MEMBERS">멤버만 가능</option>
            <option value="VIEWERS">관찰자 포함</option>
            <option value="DISABLED">사용 안 함</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            카드에 댓글을 남길 수 있는 사용자를 설정합니다.
          </p>
        </div>

        {/* 초대 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            초대 권한
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.invitation}
            onChange={(e) => handleChange('invitation', e.target.value)}
            disabled={!isOwner}
          >
            <option value="MEMBERS">멤버도 초대 가능</option>
            <option value="OWNER">관리자(Owner)만 가능</option>
          </select>
        </div>

        {/* 보드 편집 권한 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
            보드 수정 및 삭제
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            value={perms.edit}
            onChange={(e) => handleChange('edit', e.target.value)}
            disabled={!isOwner}
          >
            <option value="OWNER">관리자(Owner)만 가능</option>
            <option value="MEMBERS">멤버도 가능</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            보드 정보 수정, 리스트 추가/삭제, 보드 삭제 권한입니다.
          </p>
        </div>
      </div>

      {isOwner ? (
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
        >
          권한 저장
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">
          관리자만 권한 설정을 변경할 수 있습니다.
        </p>
      )}
    </form>
  )
}

export default PermissionsView
