import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function BoardCard({ id, imageUrl, title, isFavorite: initialIsFavorite }) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  const handleClick = () => {
    // 해당 보드 상세 페이지로 이동
    navigate(`/board/${id}`)
  }

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
      onClick={handleClick}
    >
      <img src={imageUrl} alt={title} />
      <p className="p-3 text-sm">{title}</p>
    </div>
  )
}

export default BoardCard
