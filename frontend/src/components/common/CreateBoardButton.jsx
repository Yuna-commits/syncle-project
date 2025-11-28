import React from 'react'
import CreateBoardMenu from '../modals/CreateBoardMenu'
import useUiStore from '../../stores/useUiStore'

function CreateBoardButton({ teamId, onBoardCreated }) {
  const { openedMenu, toggleMenu, closeAll } = useUiStore()

  const menuId = `createBoard_${teamId}`
  const isOpen = openedMenu === menuId

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu(menuId)
        }}
        className={`flex h-42 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200`}
      >
        + 보드 추가하기
      </div>

      {/* 메뉴가 열려있을 때만 렌더링 */}
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <CreateBoardMenu
            teamId={teamId}
            onClose={closeAll}
            onSuccess={onBoardCreated}
          />
        </div>
      )}
    </div>
  )
}

export default CreateBoardButton
