import React from 'react'
import { Routes, Route } from 'react-router-dom'
import BoardPage from '../pages/board/BoardPage'

function BoardRoutes() {
  return (
    <Routes>
      <Route path=":boardId" element={<BoardPage />} />
      <Route path=":boardId/card/:cardId" element={<BoardPage />} />
    </Routes>
  )
}

export default BoardRoutes
