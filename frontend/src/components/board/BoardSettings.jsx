import React, { useEffect, useRef, useState } from 'react'

import { ChevronLeft } from 'lucide-react'
import useBoardStore from '../../stores/useBoardStore'
import MainMenuView from './view/MainMenuView'
import BoardInfoView from './view/BoardInfoView'
import VisibilityView from './view/VisibilityView'
import PermissionsView from './view/PermissionsView'
import MembersView from './view/MembersView'
import ArchiveView from './view/ArchiveView'
import useBoardPermission from '../../hooks/useBoardPermission'

function BoardSettings({ board }) {
  const { toggleSettings, deleteBoard, isSettingsOpen } = useBoardStore()

  // 로그인 사용자의 권한 가져오기
  const { role, canManage, isExplicitMember } = useBoardPermission(board)

  const menuRef = useRef(null)

  // 현재 보고 있는 뷰의 상태
  const [currentView, setCurrentView] = useState('root')

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // 이미 닫혀있으면 실행 X
        if (isSettingsOpen) toggleSettings()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSettingsOpen, toggleSettings])

  // 메뉴가 닫힐 때 뷰 초기화
  useEffect(() => {
    if (!isSettingsOpen) {
      setTimeout(() => setCurrentView('root'), 200)
    }
  }, [isSettingsOpen])

  // 뷰 타이틀 매핑
  const viewTitles = {
    root: '메뉴',
    settings_menu: '보드 설정',
    settings_info: '보드 정보',
    settings_visibility: '공개 범위',
    settings_permissions: '권한 설정',
    members: '멤버 관리',
    files: '파일 관리',
    archive: '아카이브',
  }

  // 뒤로 가기 핸들러
  const handleBack = () => {
    if (
      ['settings_info', 'settings_visibility', 'settings_permissions'].includes(
        currentView,
      )
    ) {
      setCurrentView('settings_menu')
    } else {
      setCurrentView('root')
    }
  }

  // 뷰 렌더링
  const renderContent = () => {
    // 하위 콘텐츠에 전달되는 프로퍼티
    const props = {
      board,
      role, // 현재 '나'의 role
      isOwner: canManage, // 관리 권한
      isExplicitMember, // 보드 멤버 여부
      onChangeView: setCurrentView,
      onDeleteBoard: deleteBoard,
      boardId: board.id,
    }

    switch (currentView) {
      case 'root':
        return <MainMenuView {...props} />
      case 'settings_info':
        return <BoardInfoView {...props} />
      case 'settings_visibility':
        return <VisibilityView {...props} />
      case 'settings_permissions':
        return <PermissionsView {...props} />
      case 'members':
        return <MembersView {...props} />
      case 'archive':
        return <ArchiveView {...props} />
      default:
        return <MainMenuView {...props} />
    }
  }

  // 메뉴가 닫혀있으면 렌더링 x
  if (!isSettingsOpen) return null

  return (
    <div
      ref={menuRef}
      className="animate-in fade-in zoom-in-95 absolute top-14 right-4 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl duration-200"
      style={{ maxHeight: 'calc(100vh - 80px)' }} // 화면 높이에 맞춰 최대 높이 제한
    >
      {/* 공통 헤더 */}
      <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-gray-200 px-4">
        {currentView !== 'root' && (
          <button
            onClick={handleBack}
            className="absolute left-4 rounded-md p-1 text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100 hover:text-gray-800"
            title="뒤로 가기"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <h2 className="text-base font-bold text-gray-800">
          {viewTitles[currentView]}
        </h2>
      </div>
      {/* 콘텐츠 영역 */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: '70vh' }}>
        <div
          key={currentView}
          className="animate-in fade-in slide-in-from-right-4 duration-200"
        >
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default BoardSettings
