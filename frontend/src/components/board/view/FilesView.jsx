import React, { useMemo, useState } from 'react'
import {
  Search,
  Download,
  Calendar,
  ArrowUpDown,
  File,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import useBoardStore from '../../../stores/useBoardStore'
import { formatFileSize, getFileIcon } from '../../../utils/fileUtils'

const FilesView = ({ board }) => {
  const { findAndSelectCard, toggleSettings } = useBoardStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // 1. 보드 데이터에서 전체 파일 추출
  const allFiles = useMemo(() => {
    if (!board || !board.columns) return []

    const extracted = []

    // 모든 리스트(컬럼) 순회
    Object.values(board.columns).forEach((column) => {
      // 리스트 내의 모든 카드 순회
      column.tasks.forEach((task) => {
        // 카드의 파일 순회
        if (task.files && task.files.length > 0) {
          task.files.forEach((file) => {
            extracted.push({
              ...file,
              // 파일의 출처 정보 추가 (어느 리스트의 어느 카드인지)
              cardId: task.id,
              cardTitle: task.title,
              listTitle: column.title,
              // 날짜 포맷팅을 위한 Date 객체 변환
              dateObj: new Date(file.createdAt),
            })
          })
        }
      })
    })

    return extracted
  }, [board])

  // 2. 필터링 및 정렬 처리
  const processedFiles = useMemo(() => {
    let result = [...allFiles]

    // 검색 (파일명 or 카드명)
    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase()
      result = result.filter(
        (f) =>
          f.fileName.toLowerCase().includes(lowerQuery) ||
          f.cardTitle.toLowerCase().includes(lowerQuery),
      )
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.dateObj - a.dateObj
        case 'oldest':
          return a.dateObj - b.dateObj
        case 'name':
          return a.fileName.localeCompare(b.fileName)
        case 'size':
          return b.fileSize - a.fileSize
        default:
          return 0
      }
    })

    return result
  }, [allFiles, searchTerm, sortBy])

  // 해당 카드로 이동하는 핸들러
  const handleMoveToCard = (cardId) => {
    if (board) {
      findAndSelectCard(board, cardId)
      toggleSettings() // 설정 메뉴 닫기
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* 상단 필터 영역 */}
      <div className="shrink-0 space-y-3 border-b border-gray-100 bg-gray-50 p-4">
        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="파일명 또는 카드명 검색..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        {/* 정렬 옵션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <ArrowUpDown size={14} />
            <span>정렬 기준</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold text-gray-700 focus:ring-0"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="name">이름순</option>
            <option value="size">크기순</option>
          </select>
        </div>
      </div>

      <div
        className="custom-scrollbar overflow-y-auto p-2"
        style={{ maxHeight: '380px' }}
      >
        {processedFiles.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <File size={48} className="mb-2 opacity-20" />
            <span className="text-sm">
              {searchTerm
                ? '검색 결과가 없습니다.'
                : '업로드된 파일이 없습니다.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {processedFiles.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-100 hover:bg-indigo-50/30"
              >
                {/* 파일 정보 & 다운로드 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      {getFileIcon(file.fileName)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span
                        className="truncate text-sm font-medium text-gray-800"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="h-2 w-0.5 bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {file.createdAt
                            ? format(new Date(file.createdAt), 'yyyy.MM.dd')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 다운로드 버튼 */}
                  <a
                    href={file.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                    title="다운로드"
                  >
                    <Download size={18} />
                  </a>
                </div>

                {/* 하단 위치 정보 (카드 링크) */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="max-w-20 truncate">{file.listTitle}</span>
                    <span>&gt;</span>
                    <button
                      onClick={() => handleMoveToCard(file.cardId)}
                      className="flex max-w-[120px] items-center gap-1 truncate font-medium text-gray-600 hover:text-indigo-600 hover:underline"
                    >
                      {file.cardTitle}
                      <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 요약 */}
      <div className="mt-2 shrink-0 border-t border-gray-100 bg-gray-50 p-3 text-center text-xs text-gray-500">
        총{' '}
        <span className="font-bold text-indigo-600">
          {processedFiles.length}
        </span>
        개의 파일
      </div>
    </div>
  )
}

export default FilesView
