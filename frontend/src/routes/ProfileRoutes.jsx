import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProfileLayout from '../layouts/ProfileLayout'
import ProfilePage from '../pages/profile/ProfilePage'
import SecurityPage from '../pages/profile/SecurityPage'
import ActivityPage from '../pages/profile/ActivityPage'
import NotificationSettingPage from '../pages/profile/NotificationSettingPage'

export default function ProfileRoutes() {
  return (
    <Routes>
      <Route element={<ProfileLayout />}>
        <Route index element={<ProfilePage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="notification" element={<NotificationSettingPage />} />
      </Route>
    </Routes>
  )
}
