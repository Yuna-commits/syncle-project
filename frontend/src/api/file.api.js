import api from './AxiosInterceptor'

export const fileApi = {
  // 파일 업로드 (fileType: 'profiles', 'boards' 등 디렉토리 구분용)
  uploadFile: (file, fileType) => {
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
