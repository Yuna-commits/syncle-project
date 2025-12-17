package com.nullpointer.domain.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private Long cardId;
    private String fileName;
    private Long fileSize;
    private String fullUrl;
}
