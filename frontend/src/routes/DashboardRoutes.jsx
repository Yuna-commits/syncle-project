import React from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/main/DashboardPage'

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
    </Routes>
  )
}
