package com.nullpointer.domain.file.service;

import com.nullpointer.domain.file.dto.FileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    // 카드 첨부파일 업로드
    FileResponse uploadFile(Long cardId, MultipartFile file, Long userId);

    // 파일 삭제
    void deleteFile(Long fileId, Long userId);
}
