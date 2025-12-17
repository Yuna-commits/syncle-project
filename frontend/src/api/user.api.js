import api from './AxiosInterceptor'

export const userApi = {
  // 내 정보 조회
  fetchMe: () => api.get('/users/me'),

  // 프로필 수정
  updateProfile: (data) => api.patch('/users/me', data),

  // 비밀번호 변경 (로그인 상태)
  changePassword: (data) => api.patch('/users/password', data),

  // 계정 비활성화
  deactivateUser: () => api.patch('/users/deactivate'),

  // 계정 삭제
  deleteUser: () => api.delete('/users/me'),

  // 사용자 검색
  searchUsers: (keyword) => api.get('/users/search', { params: { keyword } }),

  // 프로필 이미지 변경
  uploadImage: (file, fileType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileType', fileType)

    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
