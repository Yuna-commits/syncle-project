// frontend/src/hooks/file/useFileMutations.js

import { useMutation } from '@tanstack/react-query'
import { fileApi } from '../../api/file.api'

export const useFileMutations = () => {
  const uploadImageMutation = useMutation({
    mutationFn: ({ file, fileType }) => fileApi.uploadImage(file, fileType),
  })

  return {
    uploadImage: uploadImageMutation.mutateAsync,
    isUploading: uploadImageMutation.isPending,
  }
}
