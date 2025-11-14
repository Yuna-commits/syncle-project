import React, { useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import NotificationMenu from '../components/modals/NotificationMenu'
import ProfileMenu from '../components/modals/ProfileMenu'

function MainLayout() {
  const [openTeamModal, setOpenTeamModal] = useState(false)
  const [openNotiMenu, setopenNotiMenu] = useState(false)
  const [openProfileMenu, setOpenProfileMenu] = useState(false)
  return (
    <>
      <Header
        onOpenTeamModal={() => setOpenTeamModal(true)}
        onOpenNotiMenu={() => setopenNotiMenu(true)}
        onOpenProfileMenu={() => setOpenProfileMenu(true)}
      />

      <div className="flex min-h-screen">
        <Sidebar />
        <Outlet />
      </div>

      {/* 팀 생성 모달 */}
      {openTeamModal && (
        <TeamCreateModal onClose={() => setOpenTeamModal(false)} />
      )}

      {/* 알림 메뉴 */}
      {openNotiMenu && (
        <NotificationMenu onClose={() => setopenNotiMenu(false)} />
      )}

      {/* 프로필 메뉴 */}

      {openProfileMenu && (
        <ProfileMenu onClose={() => setOpenProfileMenu(false)} />
      )}
    </>
  )
}

export default MainLayout
