import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import NotificationMenu from '../components/modals/NotificationMenu'
import ProfileMenu from '../components/modals/ProfileMenu'
import useUserStore from '../stores/useUserStore'

function MainLayout() {
  const [openTeamModal, setOpenTeamModal] = useState(false)
  const [openNotiMenu, setopenNotiMenu] = useState(false)
  const [openProfileMenu, setOpenProfileMenu] = useState(false)

  // 스토어에서 유저 정보 가져오기
  const { fetchUser } = useUserStore()

  // 마운트(로그인) 시 내 정보 가져오기
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <>
      <Header
        onOpenTeamModal={() => setOpenTeamModal(true)}
        onOpenNotiMenu={() => setopenNotiMenu((prev) => !prev)}
        onOpenProfileMenu={() => setOpenProfileMenu((prev) => !prev)}
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
