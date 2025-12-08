import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TeamBoardPage from '../pages/team/TeamBoardPage'
import TeamMembersPage from '../pages/team/TeamMembersPage'
import TeamInvitationsPage from '../pages/team/TeamInvitationsPage'
import TeamSetting from '../pages/team/TeamSetting'

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
