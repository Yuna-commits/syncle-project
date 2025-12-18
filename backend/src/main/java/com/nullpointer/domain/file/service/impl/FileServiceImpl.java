package com.nullpointer.domain.file.service.impl;

import com.nullpointer.domain.card.mapper.CardMapper;
import com.nullpointer.domain.card.vo.CardVo;
import com.nullpointer.domain.file.dto.FileResponse;
import com.nullpointer.domain.file.mapper.FileMapper;
import com.nullpointer.domain.file.service.FileService;
import com.nullpointer.domain.file.service.S3FileStorageService;
import com.nullpointer.domain.file.vo.FileVo;
import com.nullpointer.domain.file.vo.enums.FileType;
import com.nullpointer.domain.list.mapper.ListMapper;
import com.nullpointer.domain.list.vo.ListVo;
import com.nullpointer.global.common.SocketSender;
import com.nullpointer.global.common.enums.ErrorCode;
import com.nullpointer.global.exception.BusinessException;
import com.nullpointer.global.validator.MemberValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileMapper fileMapper;
    private final CardMapper cardMapper;
    private final ListMapper listMapper;
    private final MemberValidator memberValidator;
    private final S3FileStorageService fileStorageService;
    private final SocketSender socketSender;

    @Override
    @Transactional
    public FileResponse uploadFile(Long cardId, MultipartFile file, Long userId) {
        // 1. 카드 존재 여부 확인
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        // 2. 권한 검증
        Long boardId = validateCardAndPermission(cardId, userId);

        // 3. S3에 파일 저장
        String filePath = fileStorageService.storeFile(file, userId, FileType.ATTACHMENT);

        // 4. DB에 파일 정보 저장
        FileVo fileVo = FileVo.builder()
                .cardId(cardId)
                .uploaderId(userId)
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .createdAt(LocalDateTime.now())
                .build();

        fileMapper.insertFile(fileVo);


        // 5. 응답 반환
        // 파일 다운로드 URL 생성
        String downloadUrl = fileStorageService.getDownLoadUrl(filePath, file.getOriginalFilename());

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "FILE_UPDATE", userId, null);

        return FileResponse.of(fileVo, downloadUrl);
    }

    @Override
    public void deleteFile(Long fileId, Long userId) {
        // 파일 정보 조회
        FileVo fileVo = fileMapper.findById(fileId);
        if (fileVo == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        // 권한 검증
        Long boardId = validateCardAndPermission(fileVo.getCardId(), userId);

        // DB 삭제
        fileMapper.deleteById(fileId);

        // 소켓 전송
        socketSender.sendSocketMessage(boardId, "FILE_DELETE", userId, null);
    }


    /**
     * Helper Methods
     */

    // 카드 -> 리스트 -> 보드 순으로 id를 찾고 권한 검증
    private Long validateCardAndPermission(Long cardId, Long userId) {
        CardVo card = cardMapper.findById(cardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CARD_NOT_FOUND));

        ListVo list = listMapper.findById(card.getListId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

        Long boardId = list.getBoardId();

        // 보드 편집 권한(MEMBER 이상) 검증
        memberValidator.validateBoardEditor(boardId, userId);

        return boardId;
    }
}