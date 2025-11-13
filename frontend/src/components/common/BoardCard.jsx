import React from 'react'

function BoardCard({ imageUrl, title }) {
  return (
    <div className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg">
      <img src={imageUrl} alt={title} />
      <p className="p-3 text-sm">{title}</p>
    </div>
  )
}

export default BoardCard
