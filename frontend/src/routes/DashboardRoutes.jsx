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
      <Route path="team-board" element={<TeamBoardPage />} />
      <Route path="team-members" element={<TeamMembersPage />} />
      <Route path="team-settings" element={<TeamSetting />} />
    </Routes>
  )
}
