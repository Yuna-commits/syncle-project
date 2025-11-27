import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import NotificationMenu from '../components/modals/NotificationMenu'
import ProfileMenu from '../components/modals/ProfileMenu'
import useUserStore from '../stores/useUserStore'
import useUiStore from '../stores/useUiStore'

function MainLayout() {
  const [openTeamModal, setOpenTeamModal] = useState(false)

  // 메뉴 정보 가져오기
  const { openedMenu, closeAll } = useUiStore()

  // 스토어에서 유저 정보 가져오기
  const { fetchUser } = useUserStore()

  // 마운트(로그인) 시 내 정보 가져오기
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <div onClick={closeAll}>
      <Header onOpenTeamModal={() => setOpenTeamModal(true)} />

      <div className="flex min-h-screen">
        <Sidebar />
        <Outlet />
      </div>

      {/* 팀 생성 모달 */}
      {openTeamModal && (
        <TeamCreateModal onClose={() => setOpenTeamModal(false)} />
      )}

      {/* 알림 메뉴 */}
      {openedMenu === 'notification' && (
        <div onClick={(e) => e.stopPropagation()}>
          <NotificationMenu onClose={closeAll} />
        </div>
      )}

      {/* 프로필 메뉴 */}
      {openedMenu === 'profile' && (
        <div onClick={(e) => e.stopPropagation()}>
          <ProfileMenu onClose={closeAll} />
        </div>
      )}
    </div>
  )
}

export default MainLayout
