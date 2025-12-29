import {
  ActivityIcon,
  AlertTriangle,
  File,
  FileText,
  Globe,
  LogOut,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemberMutations } from '../../../hooks/useMemberMutations'
import { useAuthQuery } from '../../../hooks/auth/useAuthQuery'
import { useBoardDisplayMembers } from '../../../utils/useBoardDisplayMembers'

function MainMenuView({
  board,
  onChangeView,
  onDeleteBoard,
  isOwner,
  isExplicitMember,
}) {
  const navigate = useNavigate()
  const { data: user } = useAuthQuery()

  // 멤버 추방/탈퇴
  const { removeMember } = useMemberMutations(board.id)

  // 멤버 리스트 계산 로직
  const displayMembers = useBoardDisplayMembers(board)

  // 보드 탈퇴 핸들러 (본인이 Owner가 아닐 때 가능)
  const handleLeaveBoard = async () => {
    if (window.confirm(`정말 '${board.title}' 보드에서 탈퇴하시겠습니까?`)) {
      removeMember(user.id, {
        onSuccess: () => {
          alert('보드에서 탈퇴하였습니다.')
          navigate('/dashboard')
        },
        onError: () => alert('보드 탈퇴에 실패했습니다.'),
      })
    }
  }

  return (
    <div className="space-y-4 py-2">
      {/* 보드 설정 */}
      <div className="space-y-1">
        <button
          onClick={() => onChangeView('INFO')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <FileText size={18} className="text-gray-500" />
          보드 정보
        </button>
        <button
          onClick={() => onChangeView('VISIBILITY')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <Globe size={18} className="text-gray-500" />
          공개 범위
        </button>
        <button
          onClick={() => onChangeView('PERMISSIONS')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <Shield size={18} className="text-gray-500" />
          권한 설정
        </button>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* 섹션 2: 관리 메뉴 */}
      <div className="space-y-1">
        <button
          onClick={() => onChangeView('MEMBERS')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <Users size={18} className="text-gray-500" />
          멤버 관리
          <span className="ml-auto text-xs text-gray-400">
            {displayMembers.length}명
          </span>
        </button>
        <button
          onClick={() => onChangeView('FILES')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <File size={18} className="text-gray-500" />
          파일 관리
        </button>
        <button
          onClick={() => onChangeView('ACTIVITY')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <ActivityIcon size={18} className="text-gray-500" />
          활동 로그
        </button>
        <button
          onClick={() => onChangeView('ARCHIVE')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
        >
          <Trash2 size={18} className="text-gray-500" />
          아카이브 (휴지통)
        </button>
      </div>

      {/* 섹션 3: 탈퇴 (보드 멤버이면서 OWNER가 아닌 경우 가능) */}
      {/* isExplicitMember: 초대받은 정식 멤버만 탈퇴 가능 -> TEAM 공개 보드에는 멤버 탈퇴 개념이 없음! */}
      {isExplicitMember && !isOwner && (
        <button
          onClick={handleLeaveBoard}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
        >
          <LogOut size={18} className="text-red-600" />
          보드 탈퇴
        </button>
      )}

      {/* 섹션 4: 위험 구역 (관리 권한이 있는 Owner만 가능) */}
      {isOwner && (
        <>
          <div className="h-px bg-gray-200"></div>
          <div>
            <button
              onClick={() => onDeleteBoard(board.id)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-100"
            >
              <AlertTriangle size={18} className="text-red-600" />
              보드 삭제
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MainMenuView
