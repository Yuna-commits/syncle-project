import useBoardPermission from '../../hooks/board/useBoardPermission'
import AddListButton from './AddListButton'
import BoardList from './BoardList'

function BoardCanvas({ board, columnRefs, listContainerRef }) {
  const { canEdit, canEditList } = useBoardPermission(board)

  const orderedColumns = board.columnOrder
    ? board.columnOrder.map((id) => board.columns[id])
    : Object.values(board.columns)

  // 렌더링 필터링 로직
  const visibleColumns =
    orderedColumns?.filter((column) => {
      if (column.isArchived) return false
      if (column.isVirtual) {
        const hasVisibleCards = column.tasks?.some((task) => !task.isArchived)
        if (!hasVisibleCards) return false
      }
      return true
    }) || []

  // 리스트가 비어있는지 확인
  const isEmpty = visibleColumns.length === 0

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden bg-gray-100/50 p-6">
      <div className="flex h-full items-start gap-6">
        <div
          ref={listContainerRef}
          className="flex h-full w-full items-start gap-6"
        >
          {!isEmpty &&
            visibleColumns.map((column) => (
              <BoardList
                key={column.id}
                column={column}
                innerRef={(el) => (columnRefs.current[column.id] = el)}
                boardId={board.id}
                canEdit={canEdit}
                canEditList={canEditList}
              />
            ))}

          {isEmpty && !canEditList && (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-lg font-medium text-gray-400">
                표시할 정보가 없습니다.
              </p>
            </div>
          )}

          {canEditList && <AddListButton boardId={board.id} />}
        </div>
      </div>
    </div>
  )
}

export default BoardCanvas
