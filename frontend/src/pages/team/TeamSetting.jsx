import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, AlertCircle } from 'lucide-react'
import { useTeamDetailQuery } from '../../hooks/team/useTeamQuery'
import { useTeamMutations } from '../../hooks/team/useTeamMutations'

const MAX_DESC_LENGTH = 200

export default function TeamSetting() {
  const { teamId } = useParams()
  const navigate = useNavigate()

  const { data: team, isLoading } = useTeamDetailQuery(teamId)
  const { updateTeam, deleteTeam } = useTeamMutations()
  const [isSaving, setIsSaving] = useState(false)

  // 폼 데이터 관리
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    boardCreateRole: 'MEMBER',
  })

  // 초기 데이터 로드
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        boardCreateRole: team.boardCreateRole || 'MEMBER',
      })
    }
  }, [team])

  // 변경 감지 (Dirty Check) - 권한 변경도 감지
  const isChanged = useMemo(() => {
    if (!team) return false
    return (
      formData.name !== team.name ||
      (formData.description || '') !== (team.description || '') ||
      formData.boardCreateRole !== team.boardCreateRole
    )
  }, [formData, team])

  const isValid =
    formData.name.trim().length > 0 &&
    formData.description.length <= MAX_DESC_LENGTH

  const handleUpdateTeam = async () => {
    console.log('update payload:', formData)
    if (!isChanged || !isValid) return
    setIsSaving(true)
    try {
      await updateTeam({ teamId, data: formData })
    } catch (error) {
      console.error('Update failed', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (window.confirm('정말 이 팀을 삭제하시겠습니까?')) {
      try {
        await deleteTeam(teamId)
        navigate('/dashboard')
      } catch (error) {
        console.error('Delete failed', error)
      }
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">팀 설정</h2>
      </div>

      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* 기본 정보 섹션 */}
        <section className="space-y-5">
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">기본 정보</h3>
              <p className="mt-1 text-sm text-gray-500">
                팀의 이름과 설명을 수정할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleUpdateTeam}
              disabled={!isChanged || !isValid || isSaving}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                !isChanged || !isValid || isSaving
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95'
              }`}
            >
              {isSaving ? (
                '저장 중...'
              ) : (
                <>
                  <Save size={16} />
                  저장
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {/* 팀 이름 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                설명
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESC_LENGTH) {
                      setFormData({ ...formData, description: e.target.value })
                    }
                  }}
                  className="block w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {formData.description.length} / {MAX_DESC_LENGTH}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 권한 설정 섹션 */}
        <section className="space-y-4 pt-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-800">권한 설정</h3>
            <p className="mt-1 text-sm text-gray-500">
              팀 멤버들의 활동 권한을 관리합니다.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-5">
            <div>
              <p className="font-medium text-gray-800">보드 생성 권한</p>
            </div>
            <select
              value={formData.boardCreateRole}
              onChange={(e) =>
                setFormData({ ...formData, boardCreateRole: e.target.value })
              }
              className="cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            >
              <option value="MEMBER">모든 멤버</option>
              <option value="OWNER">관리자만</option>
            </select>
          </div>
        </section>

        {/* 3. 위험 구역 */}
        <section>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-red-700">
                  <AlertCircle size={18} />팀 삭제
                </h3>
                <p className="mt-1 text-sm text-red-600/80">
                  팀을 삭제하면 모든 데이터가 영구 삭제됩니다.
                </p>
              </div>
              <button
                onClick={handleDeleteTeam}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />팀 삭제
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
