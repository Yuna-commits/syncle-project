import imageCompression from 'browser-image-compression'

/**
 * 이미지 파일 압축 함수
 * @param {File} file
 * @returns {Promise<File>}
 */
export const compressImage = async (file) => {
  // 압축 옵션 설정
  const options = {
    maxSizeMB: 0.5, // 최대 0.5MB
    maxWidthOrHeight: 1920, // 최대 1920px
    useWebWorker: true, // 메인 스레드 블로킹 방지
    fileType: 'image/png', // 변환할 파일 타입
  }

  try {
    // 파일 압축
    const compressedFile = await imageCompression(file, options)

    // 압축 후 용량이 더 커지면 원본 파일 선택

    return compressedFile.size > file.size ? file : compressedFile
  } catch (error) {
    console.error('이미지 압축 중 오류 발생:', error)
    throw file
  }
}
