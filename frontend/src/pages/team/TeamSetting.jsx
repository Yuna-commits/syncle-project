import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTeamDetailQuery } from '../../hooks/team/useTeamQuery'
import { useTeamMutations } from '../../hooks/team/useTeamMutations'

export default function TeamSetting() {
  const { teamId } = useParams()

  // 팀 상세 정보 조회
  const { data: team, isLoading } = useTeamDetailQuery(teamId)

  // 팀 수정/삭제
  const { updateTeam, deleteTeam } = useTeamMutations()

  const [formData, setFormData] = useState({ name: '', description: '' })
  const [permissions, setPermissions] = useState({
    create: 'member',
    delete: 'admin',
  })

  // 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
      })
    }
  }, [team])

  // 팀 정보 수정 핸들러
  const handleUpdateTeam = () => {
    updateTeam({ teamId, data: formData })
  }

  // 팀 삭제 핸들러
  const handleDeleteTeam = () => {
    if (window.confirm('정말 이 팀을 삭제하시겠습니까?')) {
      deleteTeam(teamId)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">팀 설정</h2>

      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* 기본 정보 */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">기본 정보</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              팀 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleUpdateTeam}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-blue-700"
          >
            저장
          </button>
        </section>

        <hr className="border-gray-200" />

        {/* 권한 설정 (UI 예시) */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">권한 설정</h3>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                보드 생성 권한
              </p>
              <p className="text-xs text-gray-500">
                누가 보드를 만들 수 있나요?
              </p>
            </div>
            <select
              value={permissions.create}
              onChange={(e) =>
                setPermissions({ ...permissions, create: e.target.value })
              }
              className="rounded-md border border-gray-300 bg-white py-1 pr-8 pl-2 text-sm hover:cursor-pointer focus:outline-none"
            >
              <option value="member">모든 멤버</option>
              <option value="admin">관리자만</option>
            </select>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 위험 구역 */}
        <section className="rounded-lg border border-red-100 bg-red-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-800">팀 삭제</h3>
              <p className="text-sm text-red-600">
                모든 보드와 데이터가 영구 삭제됩니다.
              </p>
            </div>
            <button
              onClick={handleDeleteTeam}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-red-700"
            >
              삭제
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
