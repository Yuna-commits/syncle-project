package com.nullpointer.domain.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    // 파일 저장 -> 접근 가능한 URL 반환
    String storeFile(MultipartFile file, Long userId, String fileType);

    // 파일 삭제
    void deleteFile(String filePath);

}
