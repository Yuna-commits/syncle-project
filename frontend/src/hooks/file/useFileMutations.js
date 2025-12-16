// frontend/src/hooks/file/useFileMutations.js

import { useMutation } from '@tanstack/react-query'
import { fileApi } from '../../api/file.api'

export const useFileMutations = () => {
  const uploadFileMutation = useMutation({
    mutationFn: ({ file, fileType }) => fileApi.uploadFile(file, fileType),
  })

  return {
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
  }
}
