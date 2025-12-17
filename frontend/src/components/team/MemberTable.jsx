import React from 'react'
import MemberRow from './MemberRow'

function MemberTable({ members, currentUser, isOwner, teamId, teamName }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        {/* 테이블 */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                멤버
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                역할
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                직책
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                참여 보드
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                이메일
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-500"
              >
                관리
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                currentUser={currentUser}
                isOwner={isOwner} // 현재 로그인한 사용자가 OWNER인지
                teamId={teamId}
                teamName={teamName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MemberTable
