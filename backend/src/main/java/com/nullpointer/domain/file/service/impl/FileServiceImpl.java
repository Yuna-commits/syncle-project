package com.nullpointer.domain.file.service.impl;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.file.dto.FileResponse;
import com.nullpointer.domain.file.mapper.FileMapper;
import com.nullpointer.domain.file.service.FileService;
import com.nullpointer.domain.file.service.FileStorageService;
import com.nullpointer.domain.file.vo.FileVo;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileMapper fileMapper;
    private final CardMapper cardMapper;
    private final FileStorageService fileStorageService;
    private final MemberValidator memberValidator;

    @Override
    @Transactional
    public FileResponse uploadFile(Long cardId, MultipartFile file, Long userId) {
        // 1. 카드 존재 여부 확인
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        // 2. 권한 검증

        // 3. S3에 파일 저장
        String filePath = fileStorageService.storeFile(file, userId, "attachments");

        // 4. DB에 파일 정보 저장
        FileVo fileVo = FileVo.builder()
                .cardId(cardId)
                .uploaderId(userId)
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .build();

        fileMapper.insertFile(fileVo);

        // 5. 응답 반환
        // CloudFront URL 생성
        String fullUrl = fileStorageService.getFileUrl(filePath);
        return new FileResponse(
                fileVo.getFileId(),
                fileVo.getCardId(),
                fileVo.getFileName(),
                fileVo.getFileSize(),
                fullUrl
        );
    }

    @Override
    public void deleteFile(Long fileId, Long userId) {
        // 파일 정보 조회
        FileVo fileVo = fileMapper.findById(fileId);
        if (fileVo == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        // 권한 검증

        // S3에서 삭제
        fileStorageService.deleteFile(fileVo.getFilePath());

        // DB 삭제
        fileMapper.deleteById(fileId);
    }
}
