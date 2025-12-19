import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Sidebar from '../components/sidebar/Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import TeamCreateModal from '../components/modals/team/TeamCreateModal'
import useUiStore from '../stores/useUiStore'
import { useAuthQuery } from '../hooks/auth/useAuthQuery'
import { useGlobalSocket } from '../hooks/useGlobalSocket'

function MainLayout() {
  const navigate = useNavigate()
  const [openTeamModal, setOpenTeamModal] = useState(false)

  // 메뉴 정보 가져오기
  const { closeAll } = useUiStore()

  // 사용자 정보 가져오기
  // 컴포넌트 마운트 시 자동으로 'fetchMe' API 호출
  const { isError } = useAuthQuery()

  // 전역 소켓 연결 & 알림 구독 시작
  // 로그인 상태이면 소켓을 연결하고 '/user/queue/notifications' 구독
  useGlobalSocket()

  useEffect(() => {
    if (isError) {
      // 1. 토큰 삭제
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('refreshToken')

      // 2. 로그인 페이지로 이동
      navigate('/auth/signin', { replace: true })
    }
  }, [isError, navigate])

  return (
    <div onClick={closeAll} className="flex min-h-screen flex-col">
      <Header onOpenTeamModal={() => setOpenTeamModal(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Sidebar />
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto bg-white p-6">
          <Outlet />
        </main>
      </div>

      {/* 팀 생성 모달 */}
      {openTeamModal && (
        <TeamCreateModal onClose={() => setOpenTeamModal(false)} />
      )}
    </div>
  )
}

export default MainLayout
