import useBoardPermission from '../../hooks/board/useBoardPermission'
import AddListButton from './AddListButton'
import BoardList from './BoardList'

function BoardCanvas({ board, columnRefs, listContainerRef }) {
  const { canEdit } = useBoardPermission(board)

  const orderedColumns = board.columnOrder
    ? board.columnOrder.map((id) => board.columns[id])
    : Object.values(board.columns)

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden bg-gray-100/50 p-6">
      <div className="flex h-full items-start gap-6">
        <div ref={listContainerRef} className="flex h-full items-start gap-6">
          {orderedColumns
            ?.filter((column) => {
              // 기본적으로 아카이브된 리스트는 제외
              if (column.isArchived) return false

              // 완료 리스트(isVirtual)인 경우, 아카이브되지 않은 카드가 하나라도 있는지 확인
              if (column.isVirtual) {
                const hasVisibleCards = column.tasks?.some(
                  (task) => !task.isArchived,
                )
                // 보여줄 카드가 없으면 리스트 자체를 렌더링하지 않음
                if (!hasVisibleCards) return false
              }

              return true
            })
            .map((column) => (
              <BoardList
                key={column.id}
                column={column}
                innerRef={(el) => (columnRefs.current[column.id] = el)}
                canEdit={canEdit} // 리스트 작업 권한
                boardId={board.id}
              />
            ))}
          {canEdit && <AddListButton boardId={board.id} />}
        </div>
      </div>
    </div>
  )
}

export default BoardCanvas
