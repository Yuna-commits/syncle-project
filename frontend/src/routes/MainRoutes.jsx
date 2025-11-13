import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from '../pages/dashboard/Main'

export default function MainRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<Main />} />
    </Routes>
  )
}
