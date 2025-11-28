import React from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/main/DashboardPage'
import TeamMembersPage from '../pages/main/TeamMembersPage'
import TeamBoardPage from '../pages/main/TeamBoardPage'
import TeamSetting from '../pages/main/TeamSetting'

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="teams/:teamId/boards" element={<TeamBoardPage />} />
      <Route path="teams/:teamId/members" element={<TeamMembersPage />} />
      <Route path="teams/:teamId/settings" element={<TeamSetting />} />
    </Routes>
  )
}
