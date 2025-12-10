import React from 'react'
import StatCard from './StatCard'
import { Bell, CreditCard, Kanban, MessageSquare, Users } from 'lucide-react'

function ProfileStats({ user }) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-300">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
          활동 요약
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="참여 팀"
            value={user.activity?.participatedTeams || 0}
            icon={<Users size={20} />}
          />
          <StatCard
            label="보드"
            value={user.activity?.participatedBoards || 0}
            icon={<Kanban size={20} />}
          />
          <StatCard
            label="작성 카드"
            value={user.activity?.createdCards || 0}
            icon={<CreditCard size={20} />}
          />
          <StatCard
            label="댓글"
            value={user.activity?.createdComments || 0}
            icon={<MessageSquare size={20} />}
          />
          <StatCard label="알림" value={0} icon={<Bell size={20} />} />
        </div>
      </div>
    </div>
  )
}

export default ProfileStats
