package com.nullpointer.domain.file.dto;

import com.nullpointer.domain.board.dto.response.BoardResponse;
import com.nullpointer.domain.file.vo.FileVo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private Long cardId;
    private Long uploaderId;
    private String fileName;
    private Long fileSize;
    private String fullUrl;

    public static FileResponse of(FileVo vo, String fileUrl) {
        return FileResponse.builder()
                .id(vo.getId())
                .cardId(vo.getCardId())
                .uploaderId(vo.getUploaderId())
                .fileName(vo.getFileName())
                .fileSize(vo.getFileSize())
                .fullUrl(fileUrl)
                .build();
    }
}
