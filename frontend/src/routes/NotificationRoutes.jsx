import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NotificationPage from '../pages/main/NotificationPage'

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<NotificationPage />} />
    </Routes>
  )
}
