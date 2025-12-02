import React from 'react'
import Board from '../pages/board/Board'
import { Routes, Route } from 'react-router-dom'
import BoardPage from '../pages/board/BoardPage'

function BoardRoutes() {
  return (
    <Routes>
      <Route path=":boardId" element={<BoardPage />} />
    </Routes>
  )
}

export default BoardRoutes
