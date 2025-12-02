import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/AxiosInterceptor'
import { Star } from 'lucide-react'

function BoardCard({
  id,
  imageUrl,
  title,
  isFavorite: initialIsFavorite,
  onToggleFavorite,
}) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const handleClick = () => {
    // 해당 보드 상세 페이지로 이동
    navigate(`/board/${id}`)
  }

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    try {
      // 즐겨찾기 api 호출
      await api.post(`/boards/${id}/favorite`, {
        isFavorite: !isFavorite,
      })
      setIsFavorite(!isFavorite)
      if (onToggleFavorite) {
        onToggleFavorite()
      }
    } catch (error) {
      console.error('즐겨찾기 실패:', error)
      // 즐겨찾기 갯수 4개 초과 시 에러 처리
      if (error.response && error.response.status === 400) {
        alert('즐겨찾기는 최대 4개까지 설정할 수 있습니다.')
      }
    }
  }

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
      onClick={handleClick}
    >
      {/* 이미지 */}
      <div className="relative h-32 w-full">
        <img src={imageUrl} alt={title} />
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 rounded-full p-1.5 transition-all ${
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
