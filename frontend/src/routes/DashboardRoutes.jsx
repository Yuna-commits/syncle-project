import React from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/main/DashboardPage'
import TeamMembersPage from '../pages/main/TeamMembersPage'

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="team-members" element={<TeamMembersPage />} />
    </Routes>
  )
}
