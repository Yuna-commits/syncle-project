import React from 'react'
import { Paperclip, X, File, Download } from 'lucide-react'
import { useFileMutations } from '../../hooks/file/useFileMutations'
import { useParams } from 'react-router-dom'
import useBoardStore from '../../stores/useBoardStore'
import { useBoardQuery } from '../../hooks/board/useBoardQuery'
import useBoardPermission from '../../hooks/board/useBoardPermission'

function CardAttachment({ files = [] }) {
  const { boardId } = useParams()
  const { selectedCard } = useBoardStore()
  const { data: board } = useBoardQuery(boardId)
  const { canEdit } = useBoardPermission(board)
  // useFileMutations 훅을 통해 deleteFile 함수 가져오기
  const { deleteFile } = useFileMutations(Number(boardId))

  if (!files || files.length === 0) return null

  // 파일 확장자로 이미지 여부 확인
  const isImage = (fileName) => {
    if (!fileName) return false
    const ext = fileName.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
  }

  const handleDelete = (fileId) => {
    if (!confirm('정말 이 첨부파일을 삭제하시겠습니까?')) return

    deleteFile({
      fileId,
      cardId: selectedCard.id,
      listId: selectedCard.listId, // 낙관적 업데이트를 위해 listId 필요
    })
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Paperclip size={20} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">첨부파일</h3>
        </div>
      </div>

      <div className="pl-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const isImg = isImage(file.fileName)

            return (
              <div
                key={file.id}
                className="group relative flex aspect-4/3 flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md"
              >
                {/* 썸네일 영역 */}
                <div className="flex h-full w-full items-center justify-center overflow-hidden bg-gray-100">
                  {isImg ? (
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <File size={40} className="text-gray-400" />
                  )}
                </div>

                {/* 정보 및 오버레이 */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/30 via-transparent to-transparent">
                  <div className="p-3 text-white">
                    <p
                      className="truncate text-sm font-medium"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-200">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70"
                    title="다운로드"
                  >
                    <Download size={14} />
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="rounded bg-red-500/80 p-1.5 text-white backdrop-blur-sm hover:bg-red-600"
                      title="삭제"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CardAttachment
