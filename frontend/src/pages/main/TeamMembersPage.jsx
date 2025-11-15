import React, { useState } from 'react'
import defaultProfile from '../../assets/images/default.png'

export default function TeamMembersPage() {
  const members = [
    {
      id: 1,
      name: '둘리',
      teamRole: '관리자',
      position: '프론트엔드 개발자',
      email: 'dooly@mail.com',
      profile_img: defaultProfile,
      status: 'Active',
      boards: [
        { id: 1, name: '프로젝트 A', color: '#4F46E5' },
        { id: 2, name: '디자인 시스템', color: '#EC4899' },
        { id: 3, name: '백엔드 API', color: '#10B981' },
      ],
    },
    {
      id: 2,
      name: '또치',
      teamRole: '멤버',
      position: '백엔드 개발자',
      email: 'ddochi@mail.com',
      profile_img: defaultProfile,
      status: 'Pending',
      boards: [{ id: 1, name: '백엔드 API', color: '#10B981' }],
    },
    {
      id: 3,
      name: '희동이',
      teamRole: '멤버',
      position: 'UI/UX 디자이너',
      email: 'heedong@mail.com',
      profile_img: defaultProfile,
      status: 'Active',
      boards: [{ id: 1, name: '디자인 시스템', color: '#EC4899' }],
    },
    {
      id: 4,
      name: '길동이',
      teamRole: '멤버',
      position: '서비스 기획자',
      email: 'gildong@mail.com',
      profile_img: defaultProfile,
      status: 'Active',
    },
    {
      id: 5,
      name: '영희',
      teamRole: '멤버',
      position: '데이터 분석가',
      email: 'younghee@mail.com',
      profile_img: defaultProfile,
      status: 'Expired',
    },
    {
      id: 6,
      name: '철수',
      teamRole: '읽기 전용',
      position: '사장',
      email: 'chulsu@mail.com',
      profile_img: defaultProfile,
      status: 'Active',
    },
  ]

  const [openBoardMenuId, setOpenBoardMenuId] = useState(false)
  const [openRoleMenuId, setOpenRoleMenuId] = useState(false)

  const toggleBoardMenu = (id) => {
    setOpenBoardMenuId((prev) => (prev === id ? null : id))
  }

  const toggleRoleMenu = (id) => {
    setOpenRoleMenuId((prev) => (prev === id ? null : id))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="mt-10 px-2">
          <h3 className="text-xl font-semibold text-gray-800">팀 멤버 목록</h3>
        </div>

        <div className="rounded-xl border border-gray-300">
          <div className="max-w-full overflow-x-auto">
            {/* 테이블 */}
            <table className="min-w-full">
              <thead className="border-b border-gray-300">
                <tr>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    멤버
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    팀 역할
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    직책
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    보드
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    이메일
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    상태
                  </th>
                  <th className="px-5 py-3 text-start text-sm font-medium text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {members.map((member) => (
                  <tr key={member.id}>
                    {/* 유저 정보 */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <img
                            src={member.profile_img}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800">
                            {member.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 팀 역할 */}
                    <td className="relative px-4 py-3 text-sm text-gray-800">
                      <button
                        onClick={() => toggleRoleMenu(member.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1 hover:cursor-pointer hover:bg-gray-200"
                      >
                        {member.teamRole}
                      </button>

                      {/* 역할 선택 드롭다운 */}
                      {openRoleMenuId === member.id && (
                        <div className="absolute top-1/2 left-[70%] z-20 w-36 -translate-y-1/2 rounded-lg border border-gray-300 bg-white shadow-md">
                          <div className="flex flex-col p-1 text-sm text-gray-800">
                            <div className="cursor-pointer rounded-md px-3 py-2 hover:bg-gray-200">
                              관리자
                            </div>
                            <div className="cursor-pointer rounded-md px-3 py-2 hover:bg-gray-200">
                              멤버
                            </div>
                            <div className="cursor-pointer rounded-md px-3 py-2 hover:bg-gray-200">
                              읽기 전용
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 직책 (개인 직책) */}
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {member.position}
                    </td>

                    {/* 보드 */}
                    <td className="relative px-4 py-3 text-sm text-gray-800">
                      <button
                        onClick={() => toggleBoardMenu(member.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:cursor-pointer hover:bg-gray-200"
                      >
                        보드 보기
                      </button>
                      {/* 보드 리스트 */}
                      {openBoardMenuId === member.id && (
                        <div className="absolute top-1/2 left-[80%] z-20 w-48 -translate-y-1/2 rounded-lg border border-gray-300 bg-white shadow-lg">
                          <div className="max-h-48 space-y-1 overflow-y-auto p-2">
                            {/* boards가 null 또는 빈 배열일 때 */}
                            {(!member.boards || member.boards.length === 0) && (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                참여한 보드가 없습니다
                              </div>
                            )}

                            {/* 보드 목록 */}
                            {member.boards?.map((board) => (
                              <div
                                key={board.id}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-200"
                              >
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: board.color }}
                                />
                                <span className="text-sm text-gray-800">
                                  {board.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 이메일 */}
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {member.email}
                    </td>

                    {/* 상태 */}
                    <td className="px-4 py-3 text-sm">
                      {member.status === 'Active' ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                          Active
                        </span>
                      ) : member.status === 'Pending' ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* 관리 (수정 버튼) */}
                    <td className="px-4 py-3 text-sm">
                      <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-red-600 hover:cursor-pointer hover:bg-gray-200">
                        내보내기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
