import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useBoardMutations } from '../../hooks/board/useBoardMutations'

function BoardCard({ id, imageUrl, title, isFavorite, onToggleFavorite }) {
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
      <div className="relative h-32 w-full">
        <img src={imageUrl} alt={title} />
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
      <p className="p-3 text-sm">{title}</p>
    </div>
  )
}

export default BoardCard
