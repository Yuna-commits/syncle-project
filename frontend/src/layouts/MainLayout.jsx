import React, { useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import TeamCreateModal from '../components/modals/team/TeamCreateModal'
import NotificationMenu from '../components/modals/NotificationMenu'
import ProfileMenu from '../components/modals/ProfileMenu'
import useUiStore from '../stores/useUiStore'
import { useAuthQuery } from '../hooks/auth/useAuthQuery'

function MainLayout() {
  const [openTeamModal, setOpenTeamModal] = useState(false)

  // 메뉴 정보 가져오기
  const { openedMenu, closeAll } = useUiStore()

  // 사용자 정보 가져오기
  // 컴포넌트 마운트 시 자동으로 'fetchMe' API 호출
  useAuthQuery()

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
