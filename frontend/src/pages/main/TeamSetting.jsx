import React, { useState } from 'react'

export default function TeamSetting() {
  // 권한 설정을 위한 React state
  const [boardCreatePermission, setBoardCreatePermission] = useState('member') // 'admin', 'member'
  const [boardDeletePermission, setBoardDeletePermission] = useState('admin') // 'admin', 'member'

  return (
    // 1. TeamMembersPage와 동일한 <main> 레이아웃
    <main className="flex-1 overflow-y-auto bg-white p-8">
      {/* 2. TeamMembersPage와 동일한 max-w-5xl, space-y-6 컨테이너 */}
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* 3. 페이지 제목 */}
        <div className="mt-10 px-2">
          <h3 className="text-xl font-semibold text-gray-800">팀 설정</h3>
        </div>

        {/* 4. 하나의 메인 컨테이너 (divide-y로 섹션 구분) */}
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-300 bg-white shadow-sm">
          {/* ----- 1. 팀 프로필 아이템 (이름/설명/사진) ----- */}
          <section className="p-6">
            {/* [수정] 이름/설명과 프로필 사진을 옆으로 나열하기 위한 flex 컨테이너 */}
            {/* 모바일에서는 세로(flex-col), sm 사이즈 이상에서는 가로(sm:flex-row) 배치 */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* 1. 이름 / 설명 (Left) */}
              <div className="flex-1 space-y-4">
                {/* 팀 이름 */}
                <div>
                  <label
                    htmlFor="teamName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    팀 이름
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    defaultValue="Syncle Team"
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                {/* 팀 설명 */}
                <div>
                  <label
                    htmlFor="teamDescription"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    설명
                  </label>
                  <textarea
                    id="teamDescription"
                    rows={3}
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="팀에 대해 설명해주세요."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ----- 3. 보드 권한 아이템 (신규) ----- */}
          <section className="p-6">
            <div className="space-y-4 rounded-lg border border-gray-200 p-6">
              {/* 보드 생성 권한 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보드 생성
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="create-admin"
                      name="board-creation"
                      type="radio"
                      value="admin"
                      checked={boardCreatePermission === 'admin'}
                      onChange={(e) => setBoardCreatePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="create-admin"
                      className="block text-sm text-gray-800"
                    >
                      관리자
                    </label>
                  </div>
                  {/* [추가] '멤버' 옵션 */}
                  <div className="flex items-center gap-2">
                    <input
                      id="create-member"
                      name="board-creation"
                      type="radio"
                      value="member"
                      checked={boardCreatePermission === 'member'}
                      onChange={(e) => setBoardCreatePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="create-member"
                      className="block text-sm text-gray-800"
                    >
                      멤버
                    </label>
                  </div>
                  {/* [수정] '모든 사용자' 옵션 (필요시) */}
                  <div className="flex items-center gap-2">
                    <input
                      id="create-all"
                      name="board-creation"
                      type="radio"
                      value="all"
                      checked={boardCreatePermission === 'all'}
                      onChange={(e) => setBoardCreatePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="create-all"
                      className="block text-sm text-gray-800"
                    >
                      모든 사용자
                    </label>
                  </div>
                </div>
              </div>

              {/* 보드 삭제 권한 */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700">
                  보드 삭제
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="delete-admin"
                      name="board-deletion"
                      type="radio"
                      value="admin"
                      checked={boardDeletePermission === 'admin'}
                      onChange={(e) => setBoardDeletePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="delete-admin"
                      className="block text-sm text-gray-800"
                    >
                      관리자
                    </label>
                  </div>
                  {/* [추가] '멤버' 옵션 */}
                  <div className="flex items-center gap-2">
                    <input
                      id="delete-member"
                      name="board-deletion"
                      type="radio"
                      value="member"
                      checked={boardDeletePermission === 'member'}
                      onChange={(e) => setBoardDeletePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="delete-member"
                      className="block text-sm text-gray-800"
                    >
                      멤버
                    </label>
                  </div>
                  {/* [수정] '모든 사용자' 옵션 (필요시) */}
                  <div className="flex items-center gap-2">
                    <input
                      id="delete-all"
                      name="board-deletion"
                      type="radio"
                      value="all"
                      checked={boardDeletePermission === 'all'}
                      onChange={(e) => setBoardDeletePermission(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="delete-all"
                      className="block text-sm text-gray-800"
                    >
                      모든 사용자
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ----- 5. 위험 구역 아이템 (팀 삭제) ----- */}
          <section className="p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium text-gray-800">이 팀 삭제하기</h3>
                <p className="text-sm text-gray-600">
                  모든 보드와 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <button className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
                팀 삭제
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
