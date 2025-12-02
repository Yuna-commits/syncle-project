import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TeamBoardPage from '../pages/main/TeamBoardPage'
import TeamMembersPage from '../pages/main/TeamMembersPage'
import TeamInvitationsPage from '../pages/main/TeamInvitationsPage'
import TeamSetting from '../pages/main/TeamSetting'

export default function TeamRoutes() {
  return (
    <Routes>
      <Route path=":teamId/boards" element={<TeamBoardPage />} />
      <Route path=":teamId/members" element={<TeamMembersPage />} />
      <Route path=":teamId/invitations" element={<TeamInvitationsPage />} />
      <Route path=":teamId/settings" element={<TeamSetting />} />
    </Routes>
  )
}
