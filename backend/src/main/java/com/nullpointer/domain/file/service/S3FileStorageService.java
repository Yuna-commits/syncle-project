package com.nullpointer.domain.file.service;

import com.nullpointer.domain.file.vo.enums.FileType;
import org.springframework.web.multipart.MultipartFile;

public interface S3FileStorageService {

    // 파일 저장 -> 접근 가능한 URL 반환
    String storeFile(MultipartFile file, Long userId, FileType fileType);

    // CloudFront URL 반환
    String getFileUrl(String key);

    // 파일 삭제
    void deleteFile(String filePath);

    // 다운로드 URL 생성
    String getDownLoadUrl(String filePath, String fileName);

}