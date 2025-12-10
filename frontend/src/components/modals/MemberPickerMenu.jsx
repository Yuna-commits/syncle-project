import React from 'react'
import defaultProfile from '../../assets/images/default.png'
import Portal from '../ui/Portal'
import { Check } from 'lucide-react'

function MemberPickerMenu({
  isOpen,
  onClose,
  position,
  members = [], // 보드 전체 멤버 목록
  assignedMemberId, // 담당자 ID
  onSelectMember, // 멤버 선택 핸들러
}) {
  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 z-60 hover:cursor-pointer"
        onClick={onClose}
      />

      {/* 메뉴 컨텐츠 */}
      <div
        className="animate-fade-in fixed z-70 w-64 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl"
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
        }}
      >
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase">
            담당자 변경
          </h4>
        </div>

        <div className="max-h-60 overflow-y-auto p-2">
          {members.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              등록 가능한 멤버가 없습니다.
            </div>
          ) : (
            <div className="space-y-1">
              {members.map((member) => {
                const isSelected = assignedMemberId === member.id
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      onSelectMember(member)
                      onClose()
                    }}
                    className="flex w-full items-center justify-between rounded-md p-2 text-left transition-colors hover:cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      {/* 아바타 (이미지가 없으면 아이콘) */}
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600">
                        <img
                          src={member.profileImg || defaultProfile}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    {/* 선택 표시 체크 */}
                    {isSelected && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}

export default MemberPickerMenu
