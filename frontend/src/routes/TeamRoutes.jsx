// src/routes/TeamRoutes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TeamBoardPage from '../pages/team/TeamBoardPage'
import TeamMembersPage from '../pages/team/TeamMembersPage'
import TeamInvitationsPage from '../pages/team/TeamInvitationsPage'
import TeamSetting from '../pages/team/TeamSetting'
import TeamLayout from '../layouts/TeamLayout'
import TeamNoticePage from '../pages/team/TeamNoticePage'

export default function TeamRoutes() {
  return (
    <Routes>
      <Route path=":teamId" element={<TeamLayout />}>
        <Route path="boards" element={<TeamBoardPage />} />
        <Route path="notices" element={<TeamNoticePage />} />
        <Route path="members" element={<TeamMembersPage />} />
        <Route path="invitations" element={<TeamInvitationsPage />} />
        <Route path="settings" element={<TeamSetting />} />
      </Route>
    </Routes>
  )
}
