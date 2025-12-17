import imageCompression from 'browser-image-compression'
import { createElement } from 'react'
import { FileText, Image as ImageIcon, File } from 'lucide-react'

/**
 * 이미지 파일 압축 함수
 */
export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/png',
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile.size > file.size ? file : compressedFile
  } catch (error) {
    console.error('이미지 압축 중 오류 발생:', error)
    throw file
  }
}

/**
 * 파일 크기 포맷팅 함수
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 확장자에 따른 아이콘 반환 함수
 */
export const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop().toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return createElement(ImageIcon, { className: 'text-purple-500', size: 20 })
  }

  if (['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx', 'ppt'].includes(ext)) {
    return createElement(FileText, { className: 'text-blue-500', size: 20 })
  }

  return createElement(File, { className: 'text-gray-400', size: 20 })
}
