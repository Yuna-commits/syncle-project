import React from 'react'
import BoardList from './BoardList'
import useBoardPermission from '../../hooks/useBoardPermission'
import AddListButton from './AddListButton'

function BoardCanvas({ board, columnRefs, listContainerRef }) {
  const { canEdit } = useBoardPermission(board)

  const orderedColumns = board.columnOrder
    ? board.columnOrder.map((id) => board.columns[id])
    : Object.values(board.columns)

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden bg-gray-100/50 p-6">
      <div className="flex h-full items-start gap-6">
        <div ref={listContainerRef} className="flex h-full items-start gap-6">
          {orderedColumns.map((column) => (
            <BoardList
              key={column.id}
              column={column}
              innerRef={(el) => (columnRefs.current[column.id] = el)}
              canEdit={canEdit} // 리스트 작업 권한
            />
          ))}
          {canEdit && <AddListButton />}
        </div>
      </div>
    </div>
  )
}

export default BoardCanvas
