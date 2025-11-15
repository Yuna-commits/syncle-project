import React from 'react'
import Board from '../pages/board/Board'
import { Routes, Route } from 'react-router-dom'

function BoardRoutes() {
  return (
    <Routes>
      <Route index element={<Board />} />
    </Routes>
  )
}

export default BoardRoutes
