import { useNavigate } from 'react-router-dom'
import { Star, Share2, Globe, Lock } from 'lucide-react'
import { useBoardMutations } from '../../hooks/board/useBoardMutations'

function BoardCard({
  id,
  imageUrl,
  title,
  isFavorite,
  isGuest,
  visibility,
  onToggleFavorite,
}) {
  const navigate = useNavigate()
  const { toggleFavorite } = useBoardMutations(id)

  const handleClick = () => {
    // 해당 보드 상세 페이지로 이동
    navigate(`/board/${id}`)
  }

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    toggleFavorite(undefined, {
      onSuccess: () => {
        if (onToggleFavorite) onToggleFavorite()
      },
    })
  }

  return (
    <div
      className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:cursor-pointer hover:shadow-lg"
      onClick={handleClick}
    >
      {/* 이미지 */}
      <div className="relative h-30 w-full">
        <img src={imageUrl} alt={title} />
        {/* Guest 뱃지 */}
        {isGuest && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Share2 size={12} />
            <span>Guest</span>
          </div>
        )}
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 rounded-full p-1.5 transition-all hover:cursor-pointer ${
            isFavorite
              ? 'text-yellow-400 hover:scale-110' // 활성화: 노란색 채움
              : 'bg-black/30 text-white hover:scale-110 hover:bg-black/50' // 비활성화: 반투명 검은 배경 + 흰색 테두리
          }`}
        >
          {/* isFavorite 상태에 따라 채워진 별 / 빈 별 */}
          <Star
            size={20}
            fill={isFavorite ? 'currentColor' : 'none'}
            strokeWidth={isFavorite ? 0 : 2}
          />
        </button>
      </div>
      {/* 하단 정보 영역 수정 */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="truncate text-sm font-medium text-gray-800"
            title={title}
          >
            {title}
          </h3>

          {/* ★ 공개 범위 뱃지 렌더링 */}
          {visibility === 'PRIVATE' && (
            <span className="flex shrink-0 items-center gap-0.5 rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
              <Lock size={10} />
              <span>비공개</span>
            </span>
          )}
          {visibility === 'PUBLIC' && (
            <span className="flex shrink-0 items-center gap-0.5 rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
              <Globe size={10} />
              <span>전체 공개</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardCard
