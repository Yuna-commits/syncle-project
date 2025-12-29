import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoardMutations } from '../../hooks/board/useBoardMutations'
import useBoardPermission from '../../hooks/board/useBoardPermission'
import useBoardStore from '../../stores/useBoardStore'
import ArchiveView from './view/ArchiveView'
import BoardInfoView from './view/BoardInfoView'
import MainMenuView from './view/MainMenuView'
import MembersView from './view/MembersView'
import PermissionsView from './view/PermissionsView'
import VisibilityView from './view/VisibilityView'
import FilesView from './view/FilesView'
import { useToast } from '../../hooks/useToast'
import ActivityLogView from './view/ActivityLogView'

function BoardSettings({ board }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const { showToast } = useToast()

  // UI 상태 가져오기
  const {
    toggleSettings,
    isSettingsOpen,
    settingsView, // 현재 보고 있는 화면 상태
    setSettingsView, // 화면 변경 함수
  } = useBoardStore()

  // React Query
  const { deleteBoard } = useBoardMutations(board.id)

  // 로그인 사용자의 권한 가져오기
  const { role, isExplicitMember } = useBoardPermission(board)
  const isOwner = role === 'OWNER'

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

  // 사이드바가 닫히면 메뉴 초기화
  useEffect(() => {
    return () => {
      setSettingsView('MENU')
    }
  }, [setSettingsView])

  // 뒤로 가기 핸들러 (항상 메인 메뉴로 복귀)
  const handleBack = () => {
    setSettingsView('MENU')
  }

  // 보드 삭제 핸들러
  const handleDeleteBoard = () => {
    if (
      window.confirm('정말 이 보드를 삭제하시겠습니까? 복구할 수 없습니다.')
    ) {
      // [변경] 삭제 요청 및 성공 시 이동 처리
      deleteBoard(undefined, {
        onSuccess: () => {
          // 팀 보드 목록 페이지로 이동 (board.teamId 활용)
          navigate(`/teams/${board.teamId}/boards`)
          showToast('보드가 성공적으로 삭제되었습니다.', 'success')
        },
        onError: () => {
          showToast('보드 삭제에 실패했습니다.', 'error')
        },
      })
    }
  }

  // 현재 뷰에 따른 제목 결정
  const getTitle = () => {
    switch (settingsView) {
      case 'INFO':
        return '보드 정보 수정'
      case 'VISIBILITY':
        return '공개 범위 설정'
      case 'PERMISSIONS':
        return '권한 설정'
      case 'MEMBERS':
        return '멤버 관리'
      case 'FILES':
        return '파일 관리'
      case 'ACTIVITY':
        return '활동 로그'
      case 'ARCHIVE':
        return '보관된 항목'
      default:
        return '메뉴'
    }
  }

  // 하위 뷰 렌더링
  const renderContent = () => {
    switch (settingsView) {
      case 'MENU':
        return (
          <MainMenuView
            board={board}
            onChangeView={setSettingsView}
            onDeleteBoard={handleDeleteBoard}
            isOwner={isOwner}
            isExplicitMember={isExplicitMember}
          />
        )
      case 'INFO':
        return <BoardInfoView board={board} isOwner={isOwner} />
      case 'VISIBILITY':
        return <VisibilityView board={board} isOwner={isOwner} />
      case 'PERMISSIONS':
        return <PermissionsView board={board} isOwner={isOwner} />
      case 'MEMBERS':
        return <MembersView board={board} isOwner={isOwner} />
      case 'FILES':
        return <FilesView board={board} />
      case 'ACTIVITY':
        return <ActivityLogView board={board} />
      case 'ARCHIVE':
        return <ArchiveView board={board} />
      default:
        return (
          <MainMenuView
            board={board}
            onChangeView={setSettingsView}
            onDeleteBoard={handleDeleteBoard}
            isOwner={isOwner}
            isExplicitMember={isExplicitMember}
          />
        )
    }
  }

  // 메뉴가 닫혀있으면 렌더링 x
  if (!isSettingsOpen) return null

  return (
    <div
      ref={menuRef}
      className="animate-in fade-in zoom-in-95 absolute top-14 right-4 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-2xl duration-200"
      style={{ maxHeight: 'calc(100vh - 80px)' }} // 화면 높이에 맞춰 최대 높이 제한
    >
      {/* 공통 헤더 */}
      <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-gray-200">
        {/* 루트 MENU가 아닐 때만 뒤로가기 버튼 표시 */}
        {settingsView !== 'MENU' && (
          <button
            onClick={handleBack}
            className="absolute left-1 rounded-md text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100 hover:text-gray-800"
            title="뒤로 가기"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <h2 className="text-base font-bold text-gray-800">{getTitle()}</h2>
      </div>
      {/* 콘텐츠 영역 */}
      <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}

export default BoardSettings
