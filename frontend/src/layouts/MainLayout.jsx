import React, { useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import NotificationMenu from '../components/modals/NotificationMenu'

function MainLayout() {
  const [openTeamModal, setOpenTeamModal] = useState(false)
  const [openNotiMenu, setopenNotiMenu] = useState(false)
  const [openProfileMenu, setOpenProfileMenu] = useState(false)
  return (
    <>
      <Header
        onOpenTeamModal={() => setOpenTeamModal(true)}
        onOpenNotiMenu={() => setopenNotiMenu(!openNotiMenu)}
      />

      <div className="flex min-h-screen">
        <Sidebar />
        <Outlet />
      </div>

      {/* 팀 생성 모달 */}
      {openTeamModal && (
        <TeamCreateModal onClose={() => setOpenTeamModal(false)} />
      )}

      {/* 알림 모달 */}
      {openNotiMenu && (
        <NotificationMenu onClose={() => setopenNotiMenu(false)} />
      )}

      {/* 프로필 메뉴 */}
      <div className="relative">
        <div
          className="h-8 w-8 cursor-pointer rounded-full bg-blue-600"
          onClick={() => setOpenProfileMenu((prev) => !prev)}
        />
        {openProfileMenu && (
          <ProfileMenu onClose={() => setOpenProfileMenu(false)} />
        )}
      </div>
    </>
  )
}

export default MainLayout
