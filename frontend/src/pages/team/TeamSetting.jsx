import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/AxiosInterceptor'
import useTeamStore from '../../stores/useTeamStore'

export default function TeamSetting() {
  const { teamId } = useParams()
  const navigate = useNavigate()

  // 폼 데이터 상태
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')

  // useTeamStore에서 팀 정보 불러오기
  const { fetchTeams } = useTeamStore()

  // 권한 설정 상태 (초기값은 API에서 받아오거나 기본값 사용)
  const [boardCreatePermission, setBoardCreatePermission] = useState('member')
  const [boardDeletePermission, setBoardDeletePermission] = useState('admin')

  useEffect(() => {
    const fetchTeamSettings = async () => {
      try {
        const response = await api.get(`/teams/${teamId}`)
        const data = response.data.data

        // 받아온 데이터로 상태 초기화
        setTeamName(data.name)
        setDescription(data.description || '')
      } catch (error) {
        console.error('설정 불러오기 실패', error)
      }
    }
    if (teamId) fetchTeamSettings()
  }, [teamId])

  // 팀 정보 수정 핸들러
  const handleUpdateTeam = async () => {
    try {
      await api.put(`/teams/${teamId}`, {
        name: teamName,
        description: description,
      })
      alert('팀 정보가 수정되었습니다.')
      fetchTeams() // 팀 목록 갱신
    } catch (error) {
      alert(error.response?.data?.message || '팀 정보 수정 실패')
    }
  }

  // 팀 삭제 핸들러
  const handleDeleteTeam = async () => {
    if (window.confirm('정말 이 팀을 삭제하시겠습니까?')) {
      try {
        await api.delete(`/teams/${teamId}`)
        alert('팀이 삭제되었습니다.')
        fetchTeams() // 팀 목록 갱신
        navigate('/dashboard') // 삭제 후 대시보드로 이동
      } catch (error) {
        alert(error.response?.data?.message || '팀 삭제 실패')
      }
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="mt-10 flex items-center justify-between px-2">
          <h3 className="text-xl font-semibold text-gray-800">팀 설정</h3>
          {/* 저장 버튼 추가 */}
          <button
            onClick={handleUpdateTeam}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            변경사항 저장
          </button>
        </div>

        <div className="divide-y divide-gray-200 rounded-xl border border-gray-300 bg-white shadow-sm">
          {/* 1. 기본 정보 설정 */}
          <section className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-4">
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
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="팀에 대해 설명해주세요."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. 권한 설정 (기존 UI 유지, 상태 연결) */}
          <section className="p-6">
            {/* ... 권한 설정 UI (input radio checked 속성에 state 연결) ... */}
            {/* 기존 코드 그대로 사용하되 checked={boardCreatePermission === 'admin'} 등으로 연결됨 */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보드 생성 권한
                </label>
                <div className="mt-2 space-y-2">
                  {['admin', 'member', 'all'].map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="board-creation"
                        value={role}
                        checked={boardCreatePermission === role}
                        onChange={(e) =>
                          setBoardCreatePermission(e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-800 capitalize">
                        {role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. 위험 구역 (삭제) */}
          <section className="rounded-b-xl bg-red-50 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium text-red-800">이 팀 삭제하기</h3>
                <p className="text-sm text-red-600">
                  모든 보드와 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <button
                onClick={handleDeleteTeam}
                className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                팀 삭제
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
