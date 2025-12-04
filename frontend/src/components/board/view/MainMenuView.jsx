import {
  Trash2,
  Users,
  Globe,
  FileText,
  Shield,
  ActivityIcon,
} from 'lucide-react'
import React from 'react'

function MainMenuView({ board, onChangeView, onDeleteBoard, isOwner }) {
  return (
    <div className="space-y-4 py-2">
      {/* 보드 요약 */}
      <div className="space-y-1">
        <button
          onClick={() => onChangeView('settings_info')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <FileText size={18} className="text-gray-500" />
          보드 정보
        </button>
        <button
          onClick={() => onChangeView('settings_visibility')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <Globe size={18} className="text-gray-500" />
          공개 범위
        </button>
        <button
          onClick={() => onChangeView('settings_permissions')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <Shield size={18} className="text-gray-500" />
          권한 설정
        </button>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* 섹션 2: 관리 메뉴 */}
      <div className="space-y-1">
        <button
          onClick={() => onChangeView('members')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <Users size={18} className="text-gray-500" />
          멤버 관리
          <span className="ml-auto text-xs text-gray-400">
            {board.members.length}명
          </span>
        </button>
        <button
          onClick={() => onChangeView('archive')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <Trash2 size={18} className="text-gray-500" />
          아카이브 (휴지통)
        </button>
        <button
          onClick={() => alert('활동 로그 기능 (준비중)')}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
        >
          <ActivityIcon size={18} className="text-gray-500" />
          활동 로그
        </button>
      </div>

      {/* 섹션 3: 위험 구역 (Owner만 가능) */}
      {isOwner && (
        <>
          <div className="h-px bg-gray-200"></div>
          <div>
            <button
              onClick={() => onDeleteBoard(board.id)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
              보드 삭제
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MainMenuView
