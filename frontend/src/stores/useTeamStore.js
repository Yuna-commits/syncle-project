import { create } from 'zustand'
import api from '../api/AxiosInterceptor'

const useTeamStore = create((set) => ({
  teams: [],

  // 팀 목록 불러오기
  fetchTeams: async () => {
    try {
      const response = await api.get('/teams')
      set({ teams: response.data.data })
    } catch (error) {
      console.error('팀 목록 조회 실패', error)
    }
  },
}))

export default useTeamStore
