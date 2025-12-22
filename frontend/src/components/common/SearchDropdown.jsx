import React from 'react'
import defaultProfile from '../../assets/images/default.png'

function SearchDropdown({ results, isSearching, onSelect }) {
  return (
    <div className="absolute top-full right-4 left-4 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
      {isSearching ? (
        <div className="p-4 text-center text-sm text-gray-500">검색 중...</div>
      ) : results.length > 0 ? (
        <ul className="py-2">
          {results.map((board) => (
            <li key={board.id}>
              <button
                onClick={() => onSelect(board.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                {/* 썸네일 대용 아이콘 */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-100 font-bold text-blue-600">
                  {board.title.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-800">
                    {board.title}
                  </div>
                  <div className="line-clamp-1 truncate text-xs text-gray-500">
                    {board.description || '설명 없음'}
                  </div>
                </div>
                {/* 소유자 프로필 정보 추가 */}
                <div className="flex shrink-0 items-center gap-2 pl-3 text-right">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-xs font-medium text-gray-700">
                      {board.ownerName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {board.ownerEmail}
                    </span>
                  </div>
                  <img
                    src={board.ownerProfileImg || defaultProfile}
                    alt={board.ownerName}
                    className="h-8 w-8 rounded-full border border-gray-100 object-cover"
                    title={`${board.ownerName} (${board.ownerEmail})`}
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  )
}

export default SearchDropdown
