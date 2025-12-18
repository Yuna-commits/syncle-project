import { useState } from 'react'
import { Archive, RotateCcw, Trash2, Search } from 'lucide-react'
import { useListMutations } from '../../../hooks/useListMutations'
import { useCardMutations } from '../../../hooks/card/useCardMutations'
import useBoardStore from '../../../stores/useBoardStore'

export default function ArchiveView({ board }) {
  // 탭 상태: 'lists'가 기본값 (리스트 -> 카드 순)
  const [activeTab, setActiveTab] = useState('lists')
  const [searchTerm, setSearchTerm] = useState('')

  const { updateListArchiveStatus, deleteList } = useListMutations(board.id)
  const { updateCardArchiveStatus, deleteCard } = useCardMutations(board.id)
  const { openCardModal } = useBoardStore()

  // 아카이브된 리스트 필터링
  const archivedLists = Object.values(board.columns || {}).filter(
    (list) =>
      list.isArchived &&
      list.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 아카이브된 카드 필터링 (모든 리스트를 순회하며 아카이브된 카드 수집)
  const archivedCards = Object.values(board.columns || {})
    .flatMap((list) => list.tasks || [])
    .filter(
      (card) =>
        card.isArchived &&
        card.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  // 카드 복구 핸들러 로직 강화
  const handleRestoreCard = async (card) => {
    const parentList = board.columns[card.listId]

    // 1. 소속 리스트가 아카이브 상태인지 확인
    if (parentList && parentList.isArchived) {
      const shouldRestoreList = window.confirm(
        `이 카드가 속한 리스트('${parentList.title}')도 현재 아카이브 상태입니다.\n리스트와 카드를 함께 복구하시겠습니까?`,
      )

      if (shouldRestoreList) {
        // 리스트부터 복구 (await를 사용하기 위해 비동기 처리 권장)
        // 만약 mutation이 async가 아니라면 연속 호출로 처리
        updateListArchiveStatus({ listId: parentList.id, isArchived: false })
      } else {
        // 사용자가 리스트 복구를 원하지 않으면 중단
        return
      }
    }

    // 2. 카드 복구 실행
    updateCardArchiveStatus({ cardId: card.id, isArchived: false })
  }

  return (
    <div className="flex h-full flex-col">
      {/* 검색 및 탭 전환 */}
      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="아카이브 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
              activeTab === 'lists'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            리스트
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
              activeTab === 'cards'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            카드
          </button>
        </div>
      </div>

      {/* 목록 영역 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'lists' ? (
          <div className="space-y-2">
            {archivedLists.length > 0 ? (
              archivedLists.map((list) => (
                <div
                  key={list.id}
                  className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {list.title}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        updateListArchiveStatus({
                          listId: list.id,
                          isArchived: false,
                        })
                      }
                      className="rounded p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      title="보드로 복구"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('영구 삭제하시겠습니까?'))
                          deleteList(list.id)
                      }}
                      className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="영구 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">
                아카이브된 리스트가 없습니다.
              </p>
            )}
          </div>
        ) : (
          // 카드 탭 로직
          <div className="space-y-2">
            {archivedCards.length > 0 ? (
              archivedCards.map((card) => {
                const isParentArchived = board.columns[card.listId]?.isArchived

                return (
                  <div
                    key={card.id}
                    // 클릭 시 카드 상세 모달 오픈
                    onClick={() => openCardModal(card)}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:border-blue-300 ${
                      isParentArchived
                        ? 'border-gray-200 bg-gray-100'
                        : 'border-gray-100 bg-white shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="flex flex-1 flex-col pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${isParentArchived ? 'text-gray-500' : 'text-gray-700'}`}
                        >
                          {card.title}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="text-[11px] text-gray-400">
                          리스트: {board.columns[card.listId]?.title}
                        </span>
                        {isParentArchived && (
                          <span className="text-[10px] font-medium text-orange-500">
                            (리스트 비활성)
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 버튼 영역은 클릭 시 모달이 열리지 않도록 stopPropagation 추가 */}
                      <button
                        onClick={() => handleRestoreCard(card)}
                        className="rounded p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        title="보드로 복구"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('영구 삭제하시겠습니까?'))
                            deleteCard({ cardId: card.id, listId: card.listId })
                        }}
                        className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="영구 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">
                아카이브된 카드가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
